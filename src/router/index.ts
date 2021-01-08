import Auth from 'src/views/Auth.svelte';
import Dashboard from 'src/views/Dashboard.svelte';
import SessionCreating from 'src/views/SessionCreating.svelte';
import SessionViewing from 'src/views/SessionViewing.svelte';
import SessionEditing from 'src/views/SessionEditing.svelte';
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
			session: {
				always: {
					cond: 'isLoggedOut',
					target: 'auth'
				},
				initial: 'new',
				states: {
					new: view(SessionCreating),
					id: {
						initial: 'viewing',
						states: {
							viewing: view(SessionViewing),
							editing: view(SessionEditing)
						}
					}
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
				'session.new': '/session/new',
				'session.id.viewing': '/session/:id'
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
