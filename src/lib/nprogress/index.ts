import nprogress from 'nprogress';

const minMinimum = 0.3;
const maxMinimum = 0.7;
const randomMin = (): number => Math.random() * (maxMinimum - minMinimum) + minMinimum;

nprogress.configure({ showSpinner: false, trickleSpeed: 100 });

export const startProgress = (): nprogress.NProgress =>
	nprogress.configure({ minimum: randomMin() }).start();

export const endProgress = (): nprogress.NProgress => nprogress.done();
