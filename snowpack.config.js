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
	exclude: ['./src/functions/**/*', './src/styles/**/*'],
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
	buildOptions: {
		/* ... */
	},
	alias: {
		src: './src',
		coms: './src/components',
		types: './types'
	}
};
