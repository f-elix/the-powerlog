import { Machine, assign, spawn } from 'xstate';
import { validationMachine } from './validationMachine.js';

const services = {
	isAuth: async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			const error = new Error();
			error.errorMsg = 'Not authenticated';
			console.warn(error);
			throw error;
		}
		const isAuthQuery = {
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
			const res = await fetch(process.env.APP_API, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(isAuthQuery)
			});
			const data = await res.json();
			if (data.errors) {
				const error = new Error();
				error.message = data.errors[0].message;
				error.statusCode = data.errors[0].extensions.exception.statusCode;
				throw error;
			}
			if (!data.data.isAuth) {
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
			const res = await fetch(process.env.APP_API, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(query)
			});
			const data = await res.json();
			if (data.errors) {
				const error = new Error();
				error.message = data.errors[0].message;
				error.statusCode = data.errors[0].extensions.exception.statusCode;
				throw error;
			}
			const token = data.data[queryName].token;
			return token;
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
			const res = await fetch(process.env.APP_API, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(query)
			});
			const data = await res.json();
			if (data.errors) {
				const error = new Error();
				error.message = data.errors[0].message;
				error.statusCode = data.errors[0].extensions.exception.statusCode;
				throw error;
			}
			const token = data.data[queryName].token;
			return token;
		} catch (err) {
			console.error(err);
			throw err;
		}
	},
	getUserData: async (_, event) => {
		const token = event.data;
		const userQuery = {
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
			const res = await fetch(process.env.APP_API, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: token
				},
				body: JSON.stringify(userQuery)
			});
			const data = await res.json();
			if (data.errors) {
				const error = new Error();
				error.message = data.errors[0].message;
				error.statusCode = data.errors[0].extensions.exception.statusCode;
				throw error;
			}
			const userData = data.data.getUserData;
			return userData;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	routeDashboard: () => {
		// router.push('/dashboard').catch(err => console.log(err));
	},
	routeAuth: () => {
		// router.push('/').catch(err => console.log(err));
	},
	storeToken: (_, event) => {
		localStorage.setItem('token', event.data);
	},
	clearToken: () => {
		localStorage.removeItem('token');
	},
	updateAuthError: assign({
		authError: (_, event) => event.data.message
	}),
	clearError: assign({ error: '' }),
	updateUserData: assign({ userData: (_, event) => event.data }),
	clearUserData: assign({ userData: '' })
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
				entry: assign({
					validation: () => spawn(validationMachine, { sync: true })
				}),
				on: {
					SIGNUP: 'loading.signingUpUser',
					LOGIN: 'loading.loggingUser'
				}
			},
			loading: {
				initial: 'checkingForAuth',
				states: {
					checkingForAuth: {
						invoke: {
							src: 'isAuth',
							onDone: {
								target: 'loggingUser'
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
								target: '#idle',
								actions: ['updateAuthError']
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
								target: '#idle',
								actions: ['updateAuthError']
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
								target: '#idle',
								actions: ['updateAuthError']
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
					},
					LOADED: {
						actions: ['routeDashboard']
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
