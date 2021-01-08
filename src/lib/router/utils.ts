import type { Query, Params, Routes, RouterConfig } from './types';

export const parsePath: (url: string) => string = (url = window.location.hash) => {
	let [path] = url.split('?');
	path = path.replace('#', '');
	return path;
};

export const parseQueryString: (url?: string) => Query = (url = window.location.href) => {
	const qs = url.split('?')[1];
	return Object.fromEntries(new URLSearchParams(qs));
};

export const toQueryString: (query?: string | Record<string, string>) => string = (query) => {
	const qs = new URLSearchParams(query).toString();
	if (!qs) {
		return '';
	}
	return `?${qs}`;
};

export const addParamsToPath: (path: string, params: Record<string, string>) => string = (
	path,
	params
) =>
	path
		.split('/')
		.slice(1)
		.map((segment) => {
			if (!segment.startsWith(':')) {
				return segment;
			}
			const paramKey = segment.replace(':', '');
			const param = params[paramKey];
			return param || '';
		})
		.join('/');

export const matchUrlToRoute: (
	url: string,
	routes: Routes
) => { matchedRoute: string | undefined; params: Params } = (url, routes) => {
	const params: Params = {};
	const matchedRoute = Object.values(routes).find((route) => {
		const urlSegments = url.split('/').slice(1);
		const routeSegments = route.split('/').slice(1);
		if (urlSegments.length !== routeSegments.length) {
			return false;
		}
		const match = routeSegments.every((segment, i) => {
			const urlSegment = urlSegments[i];
			return segment.startsWith(':') || urlSegment === segment;
		});
		routeSegments.forEach((segment, i) => {
			if (segment.startsWith(':')) {
				const paramKey: string = segment.replace(':', '');
				params[paramKey] = urlSegments[i];
			}
		});
		return match;
	});
	return { matchedRoute, params };
};

export const stateToUrl: (config: RouterConfig, parentState?: string) => Routes = (
	config,
	parentState = ''
) => {
	const { states } = config;
	if (!states) {
		return {};
	}
	const parentPath = `/${parentState.replaceAll('.', '/')}`;
	const routes = Object.entries(states)
		.map(([state, stateNode]) => {
			const stateName = parentState ? `${parentState}.${state}` : state;
			if (typeof stateNode !== 'string' && stateNode.initial) {
				return stateToUrl(stateNode, stateName);
			}
			if (state === config.initial) {
				return {
					[stateName]: parentPath
				};
			}
			return {
				[stateName]: `${parentPath.length > 1 ? `${parentPath}/` : parentPath}${state}`
			};
		})
		.reduce(
			(obj, route) => ({
				...obj,
				...route
			}),
			{}
		);
	return routes;
};

export const getWhich = (event: MouseEvent): number =>
	event.which === null ? event.button : event.which;

export const findAnchor = (node: Node): Node | null => {
	let el: Node | null = node;
	while (el && el.nodeName.toUpperCase() !== 'A') {
		// SVG <a> elements have a lowercase name
		el = el.parentNode;
	}
	return el;
};
