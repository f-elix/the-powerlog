require('dotenv').config();
const path = require('path');
const fs = require('fs');
import alias from '@rollup/plugin-alias';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import globals from 'rollup-plugin-node-globals';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import del from 'del';

const env = (filterPrefix = 'APP_', targetPrefix = 'process.env.', excluded = []) => {
	const APP_ENV_VARS = {};
	for (let key in process.env) {
		if (key.startsWith(filterPrefix) && !excluded.includes(key)) {
			APP_ENV_VARS[targetPrefix + key] = "'" + process.env[key] + "'";
		}
	}
	return APP_ENV_VARS;
};

const aliases = () => ({
	resolve: ['.js', '.svelte', '.css'],
	entries: [
		{
			find: '@',
			replacement: path.resolve(__dirname, 'src/').replace(/\\/g, '/')
		}
	]
});

const staticDir = 'static';
const distDir = 'dist';
const buildDir = `${distDir}/build`;
const production = !process.env.ROLLUP_WATCH;
const bundling = process.env.BUNDLING || production ? 'dynamic' : 'bundle';
const shouldPrerender = typeof process.env.PRERENDER !== 'undefined' ? process.env.PRERENDER : !!production;

del.sync(distDir + '/**');

function createConfig({ output, inlineDynamicImports, plugins = [] }) {
	const transform = inlineDynamicImports ? bundledTransform : dynamicTransform;

	return {
		inlineDynamicImports,
		input: `src/main.js`,
		output: {
			name: 'app',
			sourcemap: true,
			...output
		},
		plugins: [
			alias(aliases()),
			replace({
				...env()
			}),
			copy({
				targets: [
					{
						src: [staticDir + '/*', '!**/__index.html', '!**/sw', '!**/register-service-worker.js'],
						dest: distDir
					},
					{ src: `${staticDir}/__index.html`, dest: distDir, rename: '__app.html', transform }
				],
				copyOnce: true
			}),
			svelte({
				// enable run-time checks when not in production
				dev: !production,
				hydratable: true,
				// we'll extract any component CSS out into
				// a separate file — better for performance
				css: css => {
					css.write(`${buildDir}/bundle.css`);
				}
			}),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration —
			// consult the documentation for details:
			// https://github.com/rollup/rollup-plugin-commonjs
			resolve({
				browser: true,
				dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
			}),
			commonjs(),
			globals(),
			generateCacheManifest(),

			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser(),

			...plugins
		],
		watch: {
			clearScreen: false
		}
	};
}

const bundledConfig = {
	inlineDynamicImports: true,
	output: {
		format: 'iife',
		file: `${buildDir}/bundle.js`
	},
	plugins: [!production && serve(), !production && livereload(distDir)]
};

const dynamicConfig = {
	inlineDynamicImports: false,
	output: {
		format: 'esm',
		dir: buildDir
	},
	plugins: [!production && livereload(distDir)]
};

const registerSwConfig = {
	input: `${staticDir}/register-service-worker.js`,
	output: {
		file: `${distDir}/register-service-worker.js`,
		format: 'esm'
	},
	plugins: [resolve(), terser()]
};

const swConfig = {
	input: `${staticDir}/sw/service-worker.js`,
	output: {
		file: `${distDir}/service-worker.js`,
		format: 'esm'
	},
	plugins: [
		resolve(),
		replace({
			'process.browser': true,
			__timestamp__: Date.now()
		}),
		terser()
	]
};

const configs = [createConfig(bundledConfig)];
if (bundling === 'dynamic') configs.push(createConfig(dynamicConfig));
if (shouldPrerender) [...configs].pop().plugins.push(prerender());
if (!!production) {
	configs.push(registerSwConfig);
	configs.push(swConfig);
}
export default configs;

function generateCacheManifest() {
	return {
		name: 'generate-cache-manifest',
		writeBundle(options, bundle) {
			const filePaths = generatePathsArray(distDir);
			const files = filePaths
				.filter(f => !f.endsWith('.map'))
				.map(f => f.replace(/\\/g, '/'))
				.map(f => f.replace('dist/', ''));
			const code = `export const static_files = [\n\t${files.map(f => JSON.stringify(f)).join(',\n\t')}\n]`;
			fs.writeFileSync(`${staticDir}/sw/cache-manifest.js`, code);
		}
	};
}

function generatePathsArray(dir) {
	let urls = [];
	try {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const _path = path.join(dir, file);
			const stats = fs.statSync(_path);
			if (stats.isFile()) {
				urls.push(_path);
			} else if (stats.isDirectory()) {
				urls = [...urls, ...generatePathsArray(_path)];
			}
		}
		return urls;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

function serve() {
	let started = false;
	return {
		writeBundle() {
			if (!started) {
				started = true;
				require('child_process').spawn('npm', ['run', 'serve'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}

function prerender() {
	return {
		writeBundle() {
			if (shouldPrerender) {
				require('child_process').spawn('npm', ['run', 'export'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}

function bundledTransform(contents) {
	return contents.toString().replace(
		'__SCRIPT__',
		`
	<script defer src="/build/bundle.js" ></script>
	`
	);
}

function dynamicTransform(contents) {
	return contents.toString().replace(
		'__SCRIPT__',
		`
	<script type="module" defer src="https://unpkg.com/dimport@1.0.0/dist/index.mjs?module" data-main="/build/main.js"></script>
	<script nomodule defer src="https://unpkg.com/dimport/nomodule" data-main="/build/main.js"></script>
	`
	);
}
