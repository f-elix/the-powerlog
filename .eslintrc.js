module.exports = {
	extends: ['airbnb-base', 'prettier'],
	plugins: ['svelte3', 'prettier'],
	rules: {
		'prettier/prettier': 'off',
		'no-console': ['warn', { allow: ['warn', 'error'] }],
		'func-names': 'off',
		'import/no-unresolved': [2, { ignore: ['@/'] }],
		'import/extensions': 0,
		'import/prefer-default-export': 0,
		'import/no-mutable-exports': 0,
		'import/first': 0,
		'import/no-extraneous-dependencies': 0
	},
	overrides: [
		{
			files: ['**/*.svelte'],
			processor: 'svelte3/svelte3'
		}
	],
	settings: {
		'svelte3/ignore-styles': () => true,
		'svelte3/ignore-warnings': (warning) => {
			if (warning.code === 'a11y-label-has-associated-control') {
				return true;
			}
			return false;
		}
	},
	env: {
		browser: true
	}
};
