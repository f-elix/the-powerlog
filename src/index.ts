import App from './App.svelte';
import './styles/Tailwind.css';
import './styles/fonts.css';
import './styles/app.css';
import './styles/filters.css';

const app = new App({
	target: document.body
});

export default app;

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.dispose(() => {
		app.$destroy();
	});
}

// Type override for HMR so TS doesn't complain
declare global {
	interface ImportMeta {
		hot: {
			accept: Function;
			dispose: Function;
		};
	}
}
