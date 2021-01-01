/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	extends: '@snowpack/app-scripts-svelte',
	mount: {
		public: '/',
		src: '/dist'
	},
	plugins: [
		['@snowpack/plugin-build-script', { cmd: 'postcss', input: ['.css'], output: ['.css'] }],
		'@snowpack/plugin-svelte',
		'@snowpack/plugin-dotenv',
		'@snowpack/plugin-typescript'
	],
	install: [
		/* ... */
	],
	installOptions: {
		installTypes: true
		/* ... */
	},
	devOptions: {
		port: 5000
	},
	buildOptions: {
		/* ... */
	},
	proxy: {
		/* ... */
	},
	alias: {
		'@': './src',
		coms: './src/components'
	}
};
