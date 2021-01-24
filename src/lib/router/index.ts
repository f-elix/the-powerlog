import { createMachine, interpret, assign } from 'xstate';
import ComponentTree from 'xstate-component-tree';
import {
	parseQueryString,
	toQueryString,
	parsePath,
	addParamsToPath,
	stateToUrl,
	matchUrlToRoute,
	getWhich,
	findAnchor
} from './utils';

import type {
	RouterContext,
	RouterTypestate,
	RouterStateNode,
	RouterEvent,
	Router,
	RouterConfig,
	MachineOptions,
	View,
	Routes
} from './types';

enum RouterEvents {
	url = 'router:url:',
	fallback = 'router:404',
	update = 'router:update'
}

export const view: (
	component: unknown,
	state?: RouterStateNode,
	props?: Record<string, unknown>
) => Record<string, unknown> = (component, state, props) => {
	const userState = state || {
		meta: {}
	};
	return {
		...userState,
		meta: {
			...userState.meta,
			load: (context: RouterContext, event: RouterEvent) => [
				component,
				{
					...props,
					context,
					event
				}
			]
		}
	};
};

export const createRouter: (
	machineConfig: RouterConfig,
	machineOptions?: Partial<MachineOptions<RouterContext, RouterEvent>>,
	interpreterOptions?: Record<string, unknown>
) => Router = (machineConfig, machineOptions, interpreterOptions) => {
	const fallbackState = machineConfig.meta?.fallback || machineConfig.initial;

	const $events: { [key: string]: string | Record<string, unknown> } = {
		[RouterEvents.fallback]: {
			target: fallbackState,
			actions: ['redirectToFallback']
		},
		[RouterEvents.update]: {
			actions: ['updatePage']
		}
	};

	const $routes: Routes = {
		...stateToUrl(machineConfig),
		...machineConfig.meta?.routes
	};

	Object.entries($routes).forEach(([state, url]) => {
		$events[`${RouterEvents.url}${url}`] = {
			target: state
		};
	});

	const routerMachine = createMachine<RouterContext, RouterEvent, RouterTypestate>(
		{
			...machineConfig,
			id: machineConfig.id || 'router',
			context: {
				...machineConfig.context,
				$page: {
					query: parseQueryString(),
					params: {},
					path: ''
				}
			},
			on: {
				...machineConfig.on,
				...$events
			}
		},
		{
			...machineOptions,
			actions: {
				...machineOptions?.actions,
				redirectToFallback: () => {
					const path = $routes[fallbackState];
					window.history.pushState({}, document.title, `#${path}`);
				},
				updatePage: assign({
					$page: (context, event, { state }) => {
						if (!state) {
							return {
								...context.$page,
								path: parsePath(window.location.hash)
							};
						}
						const stateStr = state.toStrings();
						const statePath = stateStr[stateStr.length - 1];
						const route = $routes[statePath];
						const params = event.params || {};
						const pathString = addParamsToPath(route, params);
						const query = event.query || {};
						const queryString = toQueryString(query);
						const url = `#/${pathString}${queryString}`;
						if (url !== window.location.hash) {
							window.history.pushState({}, document.title, url);
						}
						const path = parsePath(url);
						return {
							query,
							params,
							path
						};
					}
				})
			}
		}
	);

	const service = interpret(routerMachine, interpreterOptions);

	service.onTransition((_, event: RouterEvent) => {
		if (event.type === RouterEvents.update || event.type.includes('xstate')) {
			return;
		}
		service.send({
			type: RouterEvents.update,
			query: event.query,
			params: event.params
		});
	});

	const sendRoutingEvent = (url: string) => {
		const path = parsePath(url);
		const { matchedRoute, params } = matchUrlToRoute(path, $routes);
		if (matchedRoute) {
			service.send({
				type: `${RouterEvents.url}${matchedRoute}`,
				query: parseQueryString(url),
				params,
				external: true
			});
		} else {
			service.send({ type: RouterEvents.fallback, external: true });
		}
	};

	service.start();

	const onPopState = () => {
		sendRoutingEvent(window.location.hash);
	};

	const onSiteLinkClick = (event: MouseEvent) => {
		// Adapted from sapper.js: https://github.com/sveltejs/sapper/blob/master/runtime/src/app/router/index.ts
		if (getWhich(event) !== 1) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (event.defaultPrevented) return;

		const a: HTMLAnchorElement | SVGAElement = <HTMLAnchorElement | SVGAElement>(
			findAnchor(<Node>event.target)
		);
		if (!a?.href) {
			return;
		}
		// check if link is inside an svg
		// in this case, both href and target are always inside an object
		const svg = typeof a.href === 'object' && a.href.constructor.name === 'SVGAnimatedString';
		// const href = String(svg ? (<SVGAElement>a).href.baseVal : a.href);

		// Ignore if tag has
		// 1. 'download' attribute
		// 2. 'target' attribute
		if (a.hasAttribute('download') || svg ? (<SVGAElement>a).target.baseVal : a.target) {
			return;
		}

		const href = a.getAttribute('href');

		const hash = `#${href}`;
		if (hash === window.location.hash) {
			event.preventDefault();
			return;
		}
		event.preventDefault();
		window.location.hash = hash;
	};

	const getViews = (cb: (list: View[]) => void) => new ComponentTree(service, cb);

	window.addEventListener('popstate', onPopState);
	document.addEventListener('click', onSiteLinkClick);

	return {
		send: service.send,
		getViews
	};
};
