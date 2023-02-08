/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const vscodeExecutable = (() => {
	try {
		execSync(`which codium`, { stdio: 'ignore' });
		return 'codium';
	} catch (error) {
		return 'code';
	}
})();

const diffFiles = async (srcPath, destPath) => {
	try {
		const srcStats = fs.lstatSync(srcPath);
		const isDirectory = srcStats.isDirectory();
		if (isDirectory) {
			const subFiles = fs.readdirSync(srcPath);
			for (const subFile of subFiles) {
				const subSrcPath = path.join(srcPath, subFile);
				const subDestPath = path.join(destPath, subFile);
				await diffFiles(subSrcPath, subDestPath);
			}
		} else {
			const command = `${vscodeExecutable} --diff ${srcPath} ${destPath}`;
			const { stdout } = execSync(command, { encoding: 'utf-8' });
			if (stdout) {
				console.log(`vscode.diff output: ${stdout}`);
			}
		}
	} catch (err) {
		console.error(`Error while running vscode.diff: ${err.message}`);
	}
};

module.exports = diffFiles;