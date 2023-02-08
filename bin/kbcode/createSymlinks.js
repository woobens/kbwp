/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const runAsAdmin = require('./runAsAdmin');

const createSymlinks = async (src, dest) => {
	try {
		fs.symlinkSync(src, dest, 'dir');
		console.log(`Symlink created from ${src} to ${dest}`);
	} catch (error) {
		if (error.code === 'EPERM') {
			console.error('Failed to create symlink, trying again with administrator privileges...');
			const command = `node ${path.resolve(__filename)} .`;
			runAsAdmin(command);
		} else if (error.code !== 'EEXIST') {
			console.error(error.message);
		}
	}
};

module.exports = createSymlinks;