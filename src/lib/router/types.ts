import {
	MachineConfig,
	EventObject,
	MachineOptions,
	State,
	StateSchema,
	Action,
	ActionFunction,
	ActionObject,
	StateNodeConfig,
	Interpreter
} from 'xstate';

import type ComponentTree from 'xstate-component-tree';

export type Query = Record<string, string>;

export type Params = Record<string, string>;

export type Routes = Record<string, string>;

export interface RouterContext {
	$page: {
		query: Query;
		params: Params;
		path: string;
	};
	[key: string]: any;
}

export interface RouterEvent extends EventObject {
	query?: Record<string, string>;
	params?: Params;
	external?: boolean;
	[key: string]: any;
}

export type RouterConfig = MachineConfig<Partial<RouterContext>, any, RouterEvent>;

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
	send: Interpreter<RouterContext, any, RouterEvent, RouterTypestate>['send'];
	getViews: (cb: (list: View[]) => void) => ComponentTree;
}

export type ActionType =
	| string
	| ActionObject<RouterContext, RouterEvent>
	| ActionFunction<RouterContext, RouterEvent>
	| Action<RouterContext, RouterEvent>[]
	| undefined;

export interface RouterStateNode extends StateNodeConfig<RouterContext, any, RouterEvent> {
	meta?: Record<string, unknown>;
	initial?: string;
}

export interface ViewProps {
	context: RouterContext;
	event: RouterEvent;
	[key: string]: unknown;
}

export type { MachineOptions, State, StateSchema };
