import type {
	MachineConfig,
	EventObject,
	EventData,
	SCXML,
	MachineOptions,
	State,
	StateSchema,
	Action,
	ActionFunction,
	ActionObject,
	StateNodeConfig
} from 'xstate';

import type ComponentTree from 'xstate-component-tree';

export type Query = Record<string, string>;

export type Params = Record<string, string>;

export type Routes = Record<string, string>;

export interface RouterSchema {
	initial: string | Record<string, unknown>;
	states: {
		[key: string]: StateSchema<unknown>;
	};
	meta?: Record<string, unknown>;
}

export interface RouterContext {
	$page?: {
		query: Query;
		params: Params;
	};
	[key: string]: unknown;
}

export interface RouterEvent extends EventObject {
	query?: Record<string, string>;
	params?: Params;
	external?: boolean;
	[key: string]: any;
}

export type RouterConfig = MachineConfig<RouterContext, RouterSchema, RouterEvent>;

export interface View {
	component?: unknown;
	props?: ViewProps;
	children?: View[];
}

export interface RouterTypestate {
	value: string;
	context: RouterContext;
}

export interface Router {
	init: () => void;
	send: (
		event: string | EventObject | EventObject[] | SCXML.Event<RouterEvent>,
		payload?: EventData | undefined
	) => State<RouterContext, RouterEvent, RouterSchema>;
	update: () => void;
	getViews: (cb: (list: View[]) => void) => ComponentTree;
}

export type ActionType =
	| string
	| ActionObject<RouterContext, RouterEvent>
	| ActionFunction<RouterContext, RouterEvent>
	| Action<RouterContext, RouterEvent>[]
	| undefined;

export interface RouterStateNode extends StateNodeConfig<RouterContext, RouterSchema, RouterEvent> {
	meta?: Record<string, unknown>;
}

export interface ViewProps {
	context: RouterContext;
	event: RouterEvent;
	[key: string]: unknown;
}

export type { MachineOptions, State, StateSchema };
