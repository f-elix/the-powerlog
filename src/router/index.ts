import { createRouter, view } from '../lib/router/index';
// View Components
import Home from '../components/Home.svelte';
import About from '../components/About.svelte';
import Blog from '../components/Blog.svelte';
import NotFound from '../components/NotFound.svelte';

export const router = createRouter({
	initial: 'home',
	states: {
		home: view(Home),
		about: view(About, {}),
		blog: view(Blog, {
			initial: 'all',
			states: {
				all: {},
				post: {
					initial: 'viewing',
					states: {
						viewing: {},
						editing: {}
					}
				}
			}
		}),
		404: view(NotFound)
	},
	on: {
		home: 'home',
		about: 'about',
		blog: 'blog'
	},
	meta: {
		fallback: '404',
		routes: {
			'blog.post.viewing': '/blog/:post',
			'blog.post.editing': '/blog/:post/editing'
		}
	}
});
