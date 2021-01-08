import Auth from 'src/views/Auth.svelte';
import Dashboard from 'src/views/Dashboard.svelte';
import SessionNew from 'src/views/SessionNew.svelte';
import Session from 'src/views/Session.svelte';
import { assign } from 'xstate';
import netlifyIdentity from 'netlify-identity-widget';
import { createRouter, view } from '../lib/router/index';

export const router = createRouter(
	{
		initial: 'auth',
		context: {
			user: null,
			exercises: null
		},
		states: {
			auth: view(Auth, {
				always: {
					cond: 'isLoggedIn',
					target: 'dashboard',
					actions: ['storeUser']
				},
				on: {
					LOGIN: {
						target: 'dashboard',
						actions: ['storeUser']
					}
				}
			}),
			dashboard: {
				entry: ['closeWidget'],
				always: {
					cond: 'isLoggedOut',
					target: 'auth'
				},
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
					loaded: view(Dashboard, {
						on: {
							SESSION_NEW: '#router.session.new',
							SESSION: '#router.session.id'
						}
					})
				},
				on: {
					LOGOUT: {
						target: 'auth',
						actions: ['logout']
					}
				}
			},
			session: {
				always: {
					cond: 'isLoggedOut',
					target: 'auth'
				},
				initial: 'new',
				states: {
					new: view(SessionNew),
					id: view(Session)
				},
				on: {
					DASHBOARD: {
						target: 'dashboard'
					}
				}
			}
		},
		entry: ['initNetlifyIdentity'],
		meta: {
			routes: {
				'dashboard.fetchingExercises': '/dashboard',
				'dashboard.loaded': '/dashboard',
				'session.new': '/session/new',
				'session.id': '/session/:id'
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
			logout: assign({
				user: (_, __) => {
					netlifyIdentity.logout();
					return null;
				}
			}),
			closeWidget: () => {
				netlifyIdentity.close();
			},
			updateExercises: assign({
				exercises: (_, event) => event.data.exercises
			})
		},
		services: {
			getExercises: async (context) => {
				const { user } = context;
				if (!user) {
					return {
						exercises: context.exercises
					};
				}
				const token = user.token?.access_token;
				if (!token) {
					return {
						exercises: context.exercises
					};
				}
				try {
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
			}
		},
		guards: {
			isLoggedIn: (context, _) => !!context.user,
			isLoggedOut: (context, _) => !context.user
		}
	}
);

netlifyIdentity.on('login', (user) => {
	router.send('LOGIN', { user });
});
