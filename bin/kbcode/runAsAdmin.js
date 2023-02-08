/* eslint-disable no-console */
const os = require('os');
const { execSync } = require('child_process');

// TODO: Ensure elevated shell completion
const runAsAdmin = (command) => {
	switch (os.platform()) {
		case 'win32':
			execSync(
				`powershell Start-Process powershell -Verb runAs -ArgumentList '${command}'`
			);
			break;
		case 'linux':
		case 'darwin':
			execSync(`sudo ${command}`);
			break;
		default:
			console.error(
				`The platform "${os.platform()}" is not supported.`
			);
			break;
	}
};

module.exports = runAsAdmin;