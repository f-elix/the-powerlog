import Auth from 'src/views/Auth.svelte';
import Dashboard from 'src/views/Dashboard.svelte';
import Session from 'src/views/Session.svelte';
import { assign } from 'xstate';
import netlifyIdentity from 'netlify-identity-widget';
import { createRouter, view } from '../lib/router/index';

export const router = createRouter(
	{
		initial: 'auth',
		context: {
			user: null
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
			dashboard: view(Dashboard, {
				entry: ['closeWidget'],
				always: {
					cond: 'isLoggedOut',
					target: 'auth'
				},
				on: {
					LOGOUT: {
						target: 'auth',
						actions: ['logout']
					},
					SESSION_NEW: 'session.new',
					SESSION: 'session.id'
				}
			}),
			session: view(Session, {
				initial: 'new',
				always: {
					cond: 'isLoggedOut',
					target: 'auth'
				},
				states: {
					new: {},
					id: {}
				}
			})
		},
		entry: ['initNetlifyIdentity'],
		meta: {
			routes: {
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
