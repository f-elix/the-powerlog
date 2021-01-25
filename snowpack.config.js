/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	extends: '@snowpack/app-scripts-svelte',
	mount: {
		public: '/',
		src: '/dist'
	},
	plugins: ['@snowpack/plugin-svelte', '@snowpack/plugin-dotenv', '@snowpack/plugin-typescript'],
	packageOptions: {
		installTypes: true,
		env: {
			NODE_ENV: true
		}
	},
	devOptions: {
		port: 5000,
		output: 'stream'
	},
	alias: {
		src: './src',
		coms: './src/components',
		types: './types'
	},
	optimize: {
		bundle: true,
		minify: true,
		treeshake: true,
		manifest: false,
		target: 'es2020'
	}
};
