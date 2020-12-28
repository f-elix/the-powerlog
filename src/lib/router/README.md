# x-router

A hash-based router that uses state machines as configuration. Uses Xstate and xstate-component-tree.

## Usage

x-router exposes two functions: `createRouter` and `view`.

`createRouter` returns a `router` object. It accepts 3 arguments:

-   machineConfig (required): An xstate machine configuration, with a special `meta` property where you can define some options for the router (more below);
-   machineOptions (optional): The machine options (actions, guards, etc.);
-   interpreterOptions (optional): The options passed to the Xstate interpreter.

`view` is a utility function that generates a state node that `xstate-component-tree` can use. It accepts 3 arguments:

-   component (required): A component associated with that state route, which will be returned in thew `views` property of the `router` object;
-   state (optional): Any other property of that state;
-   props (optional): Properties that will be passed to the view component.

Example:

```js
// Import the x-router function
import { createRouter, view } from 'x-router';

// Import your view components. In this exemple we use Svelte files,
// but they could be components from any framework, or even just some html strings.
import Home from '../components/Home.svelte';
import About from '../components/About.svelte';
import Blog from '../components/Blog.svelte';
import AllPosts from '../components/AllPosts.svelte';
import Post from '../components/Post.svelte';
import PostEdit from '../components/PostEdit.svelte';
import NotFound from '../components/NotFound.svelte';

// Create a router instance
const router = createRouter({
	initial: 'home',
	states: {
		home: view(Home),
		about: view(About, {}),
		blog: {
			initial: 'all',
			states: {
				all: view(AllPosts),
				post: {
					initial: 'viewing',
					states: {
						viewing: view(Post),
						editing: view(PostEdit)
					}
				}
			}
		},
		404: view(NotFound)
	}
});
```

## Defining routes

By default, x-router generates routes from the configuration. Every state represents a route of the same name, except the initial state, which always '/'.

In our previous example, we have the following states and associated routes:

-   home: '/'
-   about: '/about'
-   'blog.all': '/blog'
-   'blog.post.viewing': '/blog/post'
-   'blog.post.editing': '/blog/post/editing
-   404: '/404'

Alternatively, you can define custom routes for every state of the configuration in the `meta` property.

```js
const router = createRouter({
	initial: 'home',
	states: {
		home: view(Home),
		about: view(About, {}),
		blog: {
			initial: 'all',
			states: {
				all: view(AllPosts),
				post: {
					initial: 'viewing',
					states: {
						viewing: view(Post),
						editing: view(PostEdit)
					}
				}
			}
		},
		404: view(NotFound)
	},
	meta: {
		routes: {
			'blog.post.viewing': '/articles/post',
			'blog.post.editing': '/articles/post/editing'
		}
	}
});
```

## Navigating

You can use a regular `<a>` tag and use a regular url in the href. The router will pick them up and append the '#' so you won't have to. As the url changes, an internal event will be sent to the router service to update the state.

## Programmatic routing

The router is internally an Xstate service. The `router` object exposes a `send` method which you can use to send events to the service. You can add any event you would like in the machine config, then use these events in your templates. As the router service enters a new state, the url will be updated.

## Fallback route

If the url doesn't match any route, the router will go to a fallback route, which by default is the initial state. You can customize this by adding a `fallback` property in the `meta` object and assigning it the state of your choice.

```js
const router = createRouter({
	initial: 'home',
	states: {
		home: view(Home),
		about: view(About, {}),
		blog: {
			initial: 'all',
			states: {
				all: view(AllPosts),
				post: {
					initial: 'viewing',
					states: {
						viewing: view(Post),
						editing: view(PostEdit)
					}
				}
			}
		},
		404: view(NotFound)
	},
	meta: {
		fallback: '404',
		routes: {
			'blog.post.viewing': '/articles/post',
			'blog.post.editing': '/articles/post/editing'
		}
	}
});
```

## Dynamic routes

To configure dynamic routes, you need to use the `routes` property of the `meta` object and add ':' in front of any dynamic parameter of the route.

```js
const router = createRouter({
	initial: 'home',
	states: {
		home: view(Home),
		about: view(About, {}),
		blog: {
			initial: 'all',
			states: {
				all: view(AllPosts),
				post: {
					initial: 'viewing',
					states: {
						viewing: view(Post),
						editing: view(PostEdit)
					}
				}
			}
		},
		404: view(NotFound)
	},
	meta: {
		fallback: '404',
		routes: {
			'blog.post.viewing': '/articles/:post',
			'blog.post.editing': '/articles/:post/editing'
		}
	}
});
```

## Accessing query string and dynamic parameters

The router will pass down the router context and event to the `props` object of the current views. You can access all the route parameters in the `$page` property of the context.

For example, the route

'/articles/:post'

accessed by the url

'/articles/article-title?some=querystring'

will give you the following:

```js
props: {
	context: {
		$page: {
			params: {
				post: 'article-title'
			},
			query: {
				some: 'querystring'
			}
		}
	}
}
```

## The router object

The router object returned by `createRouter` has the following properties:

-   init (method): Initializes the router (better called when the components are mounted or on 'DOMContentLoaded');
-   update (method): When the router initializes, it queries all the links that have a relative url in order to intercept the event. If some links are added to the DOM dynamically, they won't be known to the router unless this method is called.
-   send (method): The `service.send` method, to send an event to the router service.
-   getViews (method): A method that takes a callback function as parameter. The list of components of the current state is passed to the callback function so you can do whatever you want with it. (See https://github.com/tivac/xstate-component-tree).

## Svelte helper component

You can use the `RouterView` svelte component to render the views. Simply create a router instance pass it to the component.

router.js

```js
import { createRouter, view } from 'x-router';
import About from '../components/About.svelte';
import Blog from '../components/Blog.svelte';
import AllPosts from '../components/AllPosts.svelte';
import Post from '../components/Post.svelte';
import PostEdit from '../components/PostEdit.svelte';
import NotFound from '../components/NotFound.svelte';

export const router = createRouter({
	initial: 'home',
	states: {
		home: view(Home),
		about: view(About, {}),
		blog: {
			initial: 'all',
			states: {
				all: view(AllPosts),
				post: {
					initial: 'viewing',
					states: {
						viewing: view(Post),
						editing: view(PostEdit)
					}
				}
			}
		},
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
```

App.svelte

```html
<script>
	import RouterView from './lib/router/RouterView.svelte';
	import { router } from './router';
</script>

<RouterView {router} />
```
