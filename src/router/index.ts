import Auth from '@/views/Auth.svelte';
import Dashboard from '@/views/Dashboard.svelte';
import Session from '@/views/Session.svelte';
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
					AUTH: 'auth',
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
		on: {
			LOGOUT: {
				target: 'auth',
				actions: ['clearUser']
			}
		},
		meta: {
			routes: {
				'session.id': '/session/:id'
			}
		}
	},
	{
		actions: {
			initNetlifyIdentity: assign({
				user: (context, event) => {
					netlifyIdentity.init();
					return netlifyIdentity.currentUser();
				}
			}),
			storeUser: assign({
				user: (context, event) => event.user || netlifyIdentity.currentUser()
			}),
			clearUser: assign({
				user: (context, event) => null
			}),
			closeWidget: () => {
				netlifyIdentity.close();
			}
		},
		guards: {
			isLoggedIn: (context, event) => !!netlifyIdentity.currentUser(),
			isLoggedOut: (context, event) => !netlifyIdentity.currentUser()
		}
	}
);

netlifyIdentity.on('login', (user) => {
	router.send('LOGIN', { user });
});

netlifyIdentity.on('logout', () => {
	router.send('LOGOUT');
});
