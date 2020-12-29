import Auth from '@/views/Auth.svelte';
import Dashboard from '@/views/Dashboard.svelte';
import Session from '@/views/Session.svelte';
import { createRouter, view } from '../lib/router/index';

export const router = createRouter({
	initial: 'auth',
	states: {
		auth: view(Auth),
		dashboard: view(Dashboard),
		session: view(Session, {
			initial: 'new',
			states: {
				new: {},
				id: {}
			}
		})
	},
	meta: {
		routes: {
			'session.id': '/session/:id'
		}
	}
});
