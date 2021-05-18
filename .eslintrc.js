module.exports = {
	extends: [
		'airbnb-base',
		'prettier',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'svelte3', 'prettier'],
	rules: {
		'prettier/prettier': 'off',
		'no-console': ['warn', { allow: ['warn', 'error'] }],
		'no-underscore-dangle': 0,
		'func-names': 'off',
		'import/no-unresolved': 0,
		'import/extensions': 0,
		'import/prefer-default-export': 0,
		'import/no-mutable-exports': 0,
		'import/first': 0,
		'import/no-extraneous-dependencies': 0,
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': ['error'],
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		camelcase: [
			'error',
			{
				properties: 'never'
			}
		]
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
