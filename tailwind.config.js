const colors = require('tailwindcss/colors');

const screenExceptions = ['touch', 'pointer'];

const except = (exceptions, object) => {
	let output = {};

	Object.keys(object).forEach((key) => {
		if (!exceptions.includes(key)) {
			output[key] = object[key];
		}
	});
	return output;
};

module.exports = {
	mode: 'jit',
	purge: {
		mode: 'all',
		content: ['./src/**/*.svelte']
	},
	darkMode: false,
	theme: {
		screens: {
			min: '200px',
			ip: '430px',
			ph: '620px',
			xs: '760px',
			sm: '890px',
			md: '1120px',
			lg: '1360px',
			xl: '1560px',
			hd: '1920px',
			'2k': '2048px',
			'4k': '3840px',
			touch: { raw: '(hover: none)' },
			pointer: { raw: '(any-hover: hover)' }
		},
		spacing: (theme) => ({
			0: '0',
			10: '2rem',
			20: '4rem',
			30: '8rem',
			40: '12rem',
			50: '16rem',
			60: '20rem',
			70: '24rem',
			80: '32rem',
			90: '40rem',
			100: '48rem',
			110: '64rem',
			120: '82rem',
			130: '96rem',
			140: '120rem',
			150: '160rem',
			160: '200rem',
			170: '240rem',
			180: '300rem',
			'100vh': '100vh',
			'1/2': '50%',
			'9/10': '90%',
			...except(screenExceptions, theme('screens'))
		}),
		maxWidth: (theme) => ({
			none: 'none',
			auto: 'auto',
			...theme('spacing')
		}),
		minWidth: (theme) => ({
			none: 'none',
			auto: 'auto',
			...theme('spacing')
		}),
		maxHeight: (theme) => ({
			none: 'none',
			auto: 'auto',
			...theme('spacing')
		}),
		minHeight: (theme) => ({
			none: 'none',
			auto: 'auto',
			...theme('spacing')
		}),
		inset: (theme) => ({
			none: 'none',
			auto: 'auto',
			...theme('spacing')
		}),
		fontFamily: {
			base: ['Open Sans', 'sans-serif']
		},
		fontSize: {
			10: ['12rem', 1.5],
			20: ['14rem', 1.5],
			30: ['16rem', 1.5],
			40: ['20rem', 1.5],
			50: ['24rem', 1.4],
			60: ['32rem', 1.25],
			70: ['40rem', 1.25],
			80: ['48rem', 1.25]
		},
		borderRadius: {
			0: 0,
			10: '6px',
			full: '100%'
		},
		borderWidth: {
			10: '1px',
			20: '2px',
			30: '4px'
		},
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			white: colors.coolGray[50],
			black: colors.coolGray[800],
			primary: colors.lightBlue[900],
			info: {
				DEFAULT: colors.lightBlue[600],
				light: colors.blue[500],
				lighter: colors.blue[400]
			},
			danger: {
				DEFAULT: colors.red[900],
				medium: colors.red[500],
				light: colors.red[400]
			},
			action: colors.green[500],
			success: colors.emerald[500],
			highlight: {
				DEFAULT: colors.amber[700],
				light: colors.amber[600],
				lighter: colors.amber[300]
			},
			fg: {
				DEFAULT: colors.blueGray[700],
				light: colors.blueGray[600],
				lighter: colors.blueGray[400]
			},
			gray: colors.blueGray[400]
		},
		extend: {
			backgroundColor: (theme) => ({
				main: theme('colors.black')
			}),
			textColor: (theme) => ({
				main: theme('colors.white')
			}),
			borderColor: (theme) => ({
				main: theme('colors.white')
			}),
			cursor: {
				grab: 'grab'
			},
			transitionTimingFunction: {
				'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)'
			}
		}
	},
	variants: {
		extend: {
			ringOpacity: ['focus-visible'],
			backgroundColor: ['active', 'odd'],
			backgroundOpacity: ['active']
		}
	},
	plugins: []
};
