import { createMachine, interpret, assign } from 'xstate';
import ComponentTree from 'xstate-component-tree';
import {
	parseQueryString,
	toQueryString,
	toParamsString,
	parsePath,
	stateToUrl,
	matchUrlToRoute
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
	Routes,
	ActionType
} from './types';

enum RouterEvents {
	url = 'router:url:',
	fallback = 'router:404'
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

	const getUserEntryActions = (entry: ActionType) => {
		if (Array.isArray(entry)) {
			return entry;
		}
		if (typeof entry === 'string') {
			return [entry];
		}
		return [];
	};

	const routerMachine = createMachine<RouterContext, RouterEvent, RouterTypestate>(
		{
			...machineConfig,
			id: machineConfig.id || 'router',
			context: {
				...machineConfig.context,
				$page: {
					query: parseQueryString(),
					params: {}
				}
			},
			entry: ['updatePage', 'updateUrl', ...getUserEntryActions(machineConfig.entry)],
			on: {
				...machineConfig.on,
				...$events
			}
		},
		{
			...machineOptions,
			actions: {
				...machineOptions?.actions,
				updatePage: assign({
					$page: (_, event) => {
						const query = event.query || {};
						const params = event.params || {};
						return { query, params };
					}
				}),
				updateUrl: (context, event, { state }) => {
					if (event.external || event.type.includes('xstate')) {
						return;
					}
					const stateStr = state.toStrings();
					const statePath = stateStr[stateStr.length - 1];
					const path = $routes[statePath];
					const { params } = context.$page;
					const paramsString = toParamsString(params);
					const { query } = context.$page;
					const queryString = toQueryString(query);
					window.history.pushState(
						{},
						document.title,
						`#${path}${paramsString}${queryString}`
					);
				},
				redirectToFallback: () => {
					const path = $routes[fallbackState];
					window.history.pushState({}, document.title, `#${path}`);
				}
			}
		}
	);

	const service = interpret(routerMachine, interpreterOptions);

	const getViews = (cb: (list: View[]) => void) => new ComponentTree(service, cb);

	const currentUrl = window.location.hash;

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

	const onUrlChange = () => {
		sendRoutingEvent(window.location.hash);
	};

	const onSiteLinkClick = (e: Event) => {
		e.preventDefault();
		const newUrl = (e.target as HTMLLinkElement).getAttribute('href') || '/';
		window.location.hash = `#${newUrl}`;
	};

	const getLinks = () => {
		Array.from(document.querySelectorAll(`a[href^="/"]`))
			.filter((link) => !link.hasAttribute('download') && !link.hasAttribute('target'))
			.forEach((link) => {
				link.addEventListener('click', onSiteLinkClick);
			});
	};

	const update = () => {
		getLinks();
	};

	const init = () => {
		service.start();
		sendRoutingEvent(currentUrl);
		getLinks();
		window.addEventListener('popstate', onUrlChange);
	};

	return {
		init,
		update,
		send: service.send,
		getViews
	};
};
