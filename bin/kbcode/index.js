#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const diffFiles = require('./diffFiles');
const createSymlinks = require('./createSymlinks');

// Get the target argument
let target = process.argv[2];

const updateFiles = async (src, dest) => {
	try {
		// Calculate the source and destination paths
		const srcPath = path.resolve(__dirname, '../..', src);
		const destPath = path.resolve(dest + '/' + src);

		// Check if the file or directory exists
		if (fs.existsSync(destPath)) {
			// Get the stats for the file or directory
			const destStats = fs.statSync(destPath);

			// Check if it's a directory
			if (destStats.isDirectory()) {
				// Read the directory contents
				const srcFiles = fs.readdirSync(srcPath);
				const destFiles = fs.readdirSync(destPath);

				// Iterate through all the files in both directories
				for (const file of srcFiles) {
					// Check if the file exists in the destination directory
					if (destFiles.includes(file)) {
						// Recursively call updateFiles for this file
						await updateFiles(src + '/' + file, dest);
					} else {
						// Copy the file from the source directory to the destination directory
						const data = fs.readFileSync(srcPath + '/' + file);
						if (
							!fs.existsSync(
								path.dirname(destPath + '/' + file)
							)
						) {
							fs.mkdirSync(
								path.dirname(destPath + '/' + file),
								{
									recursive: true,
								}
							);
						}
						fs.writeFileSync(destPath + '/' + file, data, {
							flag: 'wx',
						});
						console.log(`${src} was copied to ${dest}`);
					}
				}
			} else {
				const srcFileHash = crypto
					.createHash('sha1')
					.update(fs.readFileSync(srcPath))
					.digest('hex');
				const destFileHash = crypto
					.createHash('sha1')
					.update(fs.readFileSync(destPath))
					.digest('hex');

				if (srcFileHash !== destFileHash) {
					console.log(
						`File ${src} has changes in ${dest}\nRunning vscode.diff to show differences`
					);
					await diffFiles(srcPath, destPath);
				} else {
					console.log(
						`${src} is already up to date in ${dest}`
					);
					return;
				}
			}
		} else {
			console.log(`${src} does not exist in ${dest}. Copying...`);
			// Create directory if not exist
			if (!fs.existsSync(path.dirname(destPath))) {
				fs.mkdirSync(path.dirname(destPath), {
					recursive: true,
				});
			}
			// Copy the file from the source directory to the destination directory
			const data = fs.readFileSync(srcPath);
			fs.writeFileSync(destPath, data, {
				flag: 'wx',
			});
			console.log(`${src} was copied to ${dest}`);
		}
	} catch (err) {
		console.error(`Error while updating files: ${err.message}`);
	}
};

const filesToSync = [
	'phpcs.xml.dist',
	'.stylelintrc.js',
	'.stylelintignore',
	'.prettierrc.js',
	'.prettierignore',
	'.eslintrc.js',
	'.eslintignore',
	'.editorconfig',
	'.browserslistrc',
	'.vscode/extensions.json',
	'.vscode/settings.json',
];

async function processFiles() {
	if (target === undefined) {
		console.log(`No path specified!\nUsage: kbcode <path>`);
	} else if (target === '.') {
		target = process.cwd();
	}

	for (const file of filesToSync) {
		await updateFiles(file, target);
	}
}

processFiles();

const srcNodeModules = path.resolve(__dirname, '../..', 'node_modules');
const targetNodeModules = path.resolve(target, 'node_modules');
const srcPackageJson = path.resolve(__dirname, '../..', 'package.json');
const targetPageJson = path.resolve(target, 'package.json');

createSymlinks(srcNodeModules, targetNodeModules);
createSymlinks(srcPackageJson, targetPageJson);
