/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	extends: '@snowpack/app-scripts-svelte',
	mount: {
		public: '/',
		src: '/dist'
	},
	plugins: [
		[
			'@snowpack/plugin-run-script',
			{
				cmd: 'postcss src/styles/main.css -o public/styles/main.css --no-map',
				watch: 'postcss src/styles/main.css -o public/styles/main.css --no-map -w --verbose'
			}
		],
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
		src: './src',
		coms: './src/components',
		types: './types'
	}
};
