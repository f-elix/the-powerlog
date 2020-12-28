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
	ActionObject
} from 'xstate';
import type ComponentTree from 'xstate-component-tree';

export type Query = Record<string, string>;

export type Params = Record<string, string>;

export type Routes = Record<string, string>;

export interface RouterStateNode {
	initial?: string;
	states?: {
		[key: string]: string | Record<string, unknown>;
	};
	meta?: Record<string, unknown>;
}

export interface RouterSchema {
	initial: string | Record<string, unknown>;
	states: {
		[key: string]: StateSchema<unknown>;
	};
	meta?: Record<string, unknown>;
}

export interface RouterContext {
	$page: {
		query: Query;
		params: Params;
	};
	[key: string]: unknown;
}

export interface RouterEvent extends EventObject {
	query?: Record<string, string>;
	params?: Params;
	external?: boolean;
}

export type RouterConfig = MachineConfig<RouterContext, RouterSchema, RouterEvent>;

export interface View {
	component?: unknown;
	props?: Record<string, unknown>;
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

export type { MachineOptions, State, StateSchema };
