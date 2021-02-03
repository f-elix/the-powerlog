import { assign } from 'xstate';
import netlifyIdentity, { User } from 'netlify-identity-widget';
import { getToken } from 'src/utils';
import Auth from 'src/views/Auth.svelte';
import Dashboard from 'src/views/Dashboard.svelte';
import SessionNew from 'src/views/SessionNew.svelte';
import SessionView from 'src/views/SessionView.svelte';
import SessionEdit from 'src/views/SessionEdit.svelte';
import Exercises from 'src/views/Exercises.svelte';
import ExerciseView from 'src/views/ExerciseView.svelte';
import { createRouter, view } from '../lib/router/index';

export interface AuthUser extends User {
	jwt: (force?: boolean) => Promise<string>;
}

export const router = createRouter(
	{
		context: {
			user: undefined,
			exercises: undefined
		},
		initial: 'loggedOut',
		states: {
			loggedOut: view(Auth, {
				invoke: {
					src: 'checkingAuth'
				},
				on: {
					AUTHENTICATED: {
						target: 'loggedIn',
						actions: ['storeUser']
					}
				}
			}),
			loggedIn: {
				entry: ['closeWidget'],
				invoke: {
					src: 'checkingAuth'
				},
				on: {
					NOT_AUTHENTICATED: {
						target: '.loggingOut'
					},
					LOGOUT: {
						target: '.loggingOut'
					}
				},
				initial: 'dashboard',
				states: {
					loggingOut: {
						invoke: {
							src: 'logout',
							onDone: {
								target: '#router.loggedOut',
								actions: ['clearAuth']
							},
							onError: {
								target: '#router.loggedOut',
								actions: ['clearAuth']
							}
						}
					},
					dashboard: view(Dashboard, {
						initial: 'fetchingExercises',
						states: {
							fetchingExercises: {
								invoke: {
									id: 'getExercises',
									src: 'getExercises',
									onDone: {
										target: 'loaded',
										actions: ['updateExercises']
									},
									onError: 'loaded'
								}
							},
							loaded: {
								on: {
									SESSION_NEW: '#router.loggedIn.session.new',
									SESSION: '#router.loggedIn.session.id'
								}
							}
						}
					}),
					exercises: {
						initial: 'list',
						states: {
							list: view(Exercises),
							detail: view(ExerciseView)
						}
					},
					session: {
						initial: 'new',
						states: {
							new: view(SessionNew, {
								on: {
									VIEW_UPDATED: {
										target: 'id.displaying',
										actions: ['storeSessionData']
									}
								}
							}),
							id: {
								initial: 'displaying',
								states: {
									displaying: view(SessionView, {
										on: {
											EDIT: {
												target: 'editing',
												actions: ['storeSessionData']
											}
										}
									}),
									editing: view(SessionEdit, {
										on: {
											VIEW: {
												target: 'displaying'
											},
											VIEW_UPDATED: {
												target: 'displaying',
												actions: ['storeSessionData']
											}
										}
									})
								}
							}
						},
						on: {
							DASHBOARD: {
								target: 'dashboard'
							}
						}
					}
				}
			}
		},
		entry: ['initNetlifyIdentity'],
		meta: {
			routes: {
				'loggedIn.loggingOut': '/',
				'loggedIn.dashboard.fetchingExercises': '/dashboard',
				'loggedIn.dashboard.loaded': '/dashboard',
				'loggedIn.exercises.list': '/exercises',
				'loggedIn.exercises.detail': '/exercises/:id',
				'loggedIn.session.new': '/session/new',
				'loggedIn.session.id.displaying': '/session/:id',
				'loggedIn.session.id.editing': '/session/:id/edit'
			}
		}
	},
	{
		actions: {
			initNetlifyIdentity: assign({
				user: (_, __) => {
					netlifyIdentity.init();
					return netlifyIdentity.currentUser();
				}
			}),
			storeUser: assign({
				user: (_, event) => event.user || netlifyIdentity.currentUser()
			}),
			clearAuth: assign({
				user: (_, __) => undefined,
				jwt: (_, __) => undefined,
				exercises: (_, __) => undefined
			}),
			closeWidget: () => {
				netlifyIdentity.close();
			},
			updateExercises: assign({
				exercises: (_, event) => event.data.exercises
			}),
			storeSessionData: assign({
				session: (_, event) => event.data.session
			})
		},
		services: {
			checkingAuth: (context) => async (callback) => {
				const user: AuthUser = context.user || netlifyIdentity.currentUser();
				if (!user || !user.token) {
					callback('NOT_AUTHENTICATED');
					return;
				}
				try {
					callback({ type: 'AUTHENTICATED', user });
				} catch (error) {
					console.warn(error);
				}
			},
			getExercises: async (context) => {
				try {
					const { user } = context;
					const token = await getToken();
					if (!user || !token) {
						return {
							exercises: context.exercises
						};
					}
					const res = await fetch('/.netlify/functions/get-exercises', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						}
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					return {
						exercises: context.exercises
					};
				}
			},
			logout: async () => {
				try {
					await netlifyIdentity.logout();
				} catch (error) {
					console.warn(error);
					throw error;
				}
			}
		},
		guards: {
			isLoggedOut: (context, _) => !context.user && !context.jwt
		}
	}
);

netlifyIdentity.on('login', async (user) => {
	const jwt = user.token?.access_token;
	router.send({ type: 'AUTHENTICATED', user, jwt });
});
