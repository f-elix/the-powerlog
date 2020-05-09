import { Machine, assign, spawn, send } from 'xstate';
import { validationMachine } from './validationMachine.js';
import { getData, getToken } from '@/js/utils.js';

const services = {
	isAuth: async () => {
		const token = getToken();
		const queryName = 'isAuth';
		const query = {
			query: `
				query isAuthenticated($token: String!) {
					isAuth(token: $token)
				}
			`,
			variables: {
				token: token
			}
		};
		try {
			const isAuth = await getData(query, queryName);
			if (!isAuth) {
				const error = new Error();
				error.errorMsg = 'Not authenticated';
				throw error;
			}
			return token;
		} catch (err) {
			console.warn(err);
			throw err;
		}
	},
	signUpUser: async (context, _) => {
		const { name, email, password } = context.validation.state.context;
		const queryName = 'signupUser';
		const query = {
			query: `
				mutation signupUser($name: String!, $email: String!, $password: String!) {
					signupUser(name: $name, email: $email, password: $password) {
						token
					}
				}
			`,
			variables: {
				name,
				email,
				password
			}
		};
		try {
			const data = await getData(query, queryName);
			return data.token;
		} catch (err) {
			console.error(err);
			throw err;
		}
	},
	loginUser: async (context, _) => {
		const { email, password } = context.validation.state.context;
		const queryName = 'loginUser';
		const query = {
			query: `
			mutation loginUser($email: String!, $password: String!) {
				loginUser(email: $email, password: $password) {
				token
				}
			}
			`,
			variables: {
				email,
				password
			}
		};
		try {
			const data = await getData(query, queryName);
			return data.token;
		} catch (err) {
			console.error(err);
			throw err;
		}
	},
	getUserData: async (_, event) => {
		const token = getToken();
		const queryName = 'getUserData';
		const query = {
			query: `
				{
					getUserData {
						name
						createdAt
					}
				}
			`
		};
		try {
			const userData = await getData(query, queryName, token);
			return userData;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	storeToken: (_, event) => {
		localStorage.setItem(process.env.APP_TOKEN, event.data);
	},
	clearToken: () => {
		localStorage.removeItem(process.env.APP_TOKEN);
	},
	updateAuthError: assign({
		authError: (_, event) => event.data.message
	}),
	clearAuthError: assign({ authError: '' }),
	updateUserData: assign({ userData: (_, event) => event.data }),
	clearUserData: assign({ userData: '' }),
	notifyResetValidation: send('RESET', {
		to: context => context.validation
	}),
	setValidation: assign({
		validation: () => spawn(validationMachine, { sync: true })
	})
};

export const authMachine = Machine(
	{
		id: 'auth',
		context: {
			userData: {},
			authError: '',
			loading: false,
			validation: null
		},
		initial: 'loading',
		states: {
			idle: {
				id: 'idle',
				initial: 'init',
				states: {
					init: {
						entry: ['setValidation'],
						on: {
							'': {
								target: 'ready'
							}
						}
					},
					ready: {
						on: {
							SIGNUP: {
								target: '#loading.signingUpUser'
							},
							LOGIN: {
								target: '#loading.loggingUser'
							},
							CLEAR_ERROR: {
								actions: ['clearAuthError']
							}
						}
					}
				}
			},
			loading: {
				id: 'loading',
				initial: 'checkingForAuth',
				states: {
					checkingForAuth: {
						invoke: {
							src: 'isAuth',
							onDone: {
								target: 'gettingUserData'
							},
							onError: {
								target: '#idle'
							}
						}
					},
					signingUpUser: {
						invoke: {
							src: 'signUpUser',
							onDone: {
								target: 'gettingUserData',
								actions: ['storeToken']
							},
							onError: {
								target: '#idle.ready',
								actions: ['updateAuthError', 'notifyResetValidation']
							}
						}
					},
					loggingUser: {
						invoke: {
							src: 'loginUser',
							onDone: {
								target: 'gettingUserData',
								actions: ['storeToken']
							},
							onError: {
								target: '#idle.ready',
								actions: ['updateAuthError', 'notifyResetValidation']
							}
						}
					},
					gettingUserData: {
						invoke: {
							src: 'getUserData',
							onDone: {
								target: '#authenticated',
								actions: ['updateUserData', 'routeDashboard']
							},
							onError: {
								target: '#idle.ready',
								actions: ['updateAuthError', 'notifyResetValidation']
							}
						}
					}
				}
			},
			authenticated: {
				id: 'authenticated',
				on: {
					LOGOUT: {
						target: 'idle',
						actions: ['clearToken', 'clearUserData', 'routeAuth']
					}
				}
			}
		}
	},
	{
		services,
		actions
	}
);
