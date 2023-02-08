module.exports = {
	root: true,
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	rules: {
		'prettier/prettier': 'off',
		// 'no-var': 'off',
	},
	env: {
		browser: true,
		commonjs: true,
		es6: false,
		jquery: true,
	},
};
