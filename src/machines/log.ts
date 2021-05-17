import { createMachine, assign } from 'xstate';
import { startProgress, endProgress } from 'src/lib/nprogress';
import { assertEventType, getToken, isTouchDevice } from 'src/utils';
import type { Session } from 'types';

interface FilterData {
	filterType?: string;
	value?: Record<string, string | number>;
	debounce?: boolean;
}

interface LogContext {
	sessions?: Session[];
	cachedSessions?: Session[];
	cursor?: string;
	limit: number;
	hasNextPage: boolean;
	error?: string;
	filterData?: FilterData;
}

export enum LoadEvents {
	LOAD = 'LOAD',
	LOADMORE = 'LOAD_MORE'
}

type LogEvent =
	| { type: LoadEvents.LOAD }
	| { type: LoadEvents.LOADMORE }
	| { type: 'done.invoke.fetchUserSessions'; data: { sessions: Session[] } }
	| { type: 'error.platform.fetchUserSessions'; data: string }
	| {
			type: 'FILTER';
			data: FilterData;
	  }
	| { type: 'CLEAR' }
	| { type: 'done.invoke.filter'; data: { sessions: Session[] } }
	| { type: 'error.platform.filter'; data: string };

type LogState =
	| {
			value: 'idle';
			context: LogContext;
	  }
	| {
			value: 'debouncing';
			context: LogContext;
	  }
	| {
			value: 'fetching';
			context: LogContext;
	  }
	| {
			value: 'fetching.sessions';
			context: LogContext;
	  }
	| {
			value: 'fetching.filtering';
			context: LogContext;
	  }
	| {
			value: 'loaded';
			context: LogContext;
	  }
	| {
			value: 'loaded.empty';
			context: LogContext;
	  }
	| {
			value: 'loaded.normal';
			context: LogContext;
	  }
	| {
			value: 'loaded.end';
			context: LogContext;
	  }
	| {
			value: 'filtered';
			context: LogContext;
	  }
	| {
			value: 'filtered.empty';
			context: LogContext;
	  }
	| {
			value: 'filtered.normal';
			context: LogContext;
	  };

export const logMachine = createMachine<LogContext, LogEvent, LogState>(
	{
		id: 'log',
		context: {
			sessions: undefined,
			cachedSessions: undefined,
			cursor: undefined,
			limit: 10,
			error: undefined,
			hasNextPage: true,
			filterData: {}
		},
		initial: 'idle',
		states: {
			idle: {
				on: {
					LOAD: {
						target: 'fetching.sessions'
					}
				}
			},
			debouncing: {
				tags: ['clear-btn'],
				after: {
					DEBOUNCE_DELAY: {
						target: 'fetching.filtering'
					}
				}
			},
			fetching: {
				entry: ['startProgress'],
				exit: ['endProgress'],
				initial: 'sessions',
				states: {
					sessions: {
						invoke: {
							id: 'fetchUserSessions',
							src: 'fetchUserSessions',
							onDone: {
								target: '#log.loaded',
								actions: ['updatePaginatedSessions']
							},
							onError: {
								target: '#log.loaded',
								actions: ['updateError']
							}
						}
					},
					filtering: {
						tags: ['clear-btn'],
						invoke: {
							id: 'filter',
							src: 'filter',
							onDone: {
								target: '#log.filtered',
								actions: ['updateFilteredSessions']
							},
							onError: {
								target: '#log.filtered',
								actions: ['updateError']
							}
						}
					}
				}
			},
			loaded: {
				initial: 'transient',
				states: {
					transient: {
						always: [
							{
								cond: 'isEmpty',
								target: 'empty'
							},
							{
								cond: 'hasNextPage',
								target: 'normal'
							},
							{
								target: 'end'
							}
						]
					},
					empty: {},
					normal: {
						on: {
							LOAD_MORE: {
								target: '#log.fetching.sessions'
							}
						}
					},
					end: {}
				}
			},
			filtered: {
				tags: ['clear-btn'],
				initial: 'transient',
				states: {
					transient: {
						always: [
							{
								cond: 'isEmpty',
								target: 'empty'
							},
							{
								target: 'normal'
							}
						]
					},
					empty: {},
					normal: {}
				}
			}
		},
		on: {
			FILTER: [
				{
					cond: 'debounce',
					target: 'debouncing',
					actions: ['updateFilterData', 'cacheSessions']
				},
				{
					target: 'fetching.filtering',
					actions: ['updateFilterData', 'cacheSessions']
				}
			],
			CLEAR: {
				target: 'loaded.normal',
				actions: ['clearFilteredSessions']
			}
		}
	},
	{
		actions: {
			updatePaginatedSessions: assign((context, event) => {
				assertEventType(event, 'done.invoke.fetchUserSessions');
				const currentSessions = context.sessions || [];
				const eventSessions = event.data.sessions || [];
				const hasNextPage = eventSessions.length > context.limit;
				const newSessions = hasNextPage ? eventSessions.slice(0, -1) : eventSessions;
				const cursor = newSessions[newSessions.length - 1]?.date;
				return {
					sessions: [...currentSessions, ...newSessions],
					cursor,
					hasNextPage
				};
			}),
			updateFilteredSessions: assign({
				sessions: (_, event) => {
					assertEventType(event, 'done.invoke.filter');
					return event.data.sessions;
				}
			}),
			cacheSessions: assign({
				cachedSessions: (context, event) => {
					assertEventType(event, 'FILTER');
					return context.cachedSessions ? context.cachedSessions : context.sessions;
				},
				sessions: (_, __) => []
			}),
			clearFilteredSessions: assign({
				sessions: (context, event) => {
					assertEventType(event, 'CLEAR');
					const filterCtn = <HTMLDivElement>document.querySelector('#filters');
					if (!filterCtn) {
						return context.cachedSessions;
					}
					filterCtn.querySelectorAll('input').forEach((i) => {
						const input = i;
						input.value = '';
					});
					return context.cachedSessions;
				}
			}),
			updateFilterData: assign({
				filterData: (_, event) => {
					assertEventType(event, 'FILTER');
					return event.data;
				}
			}),
			updateError: assign({
				error: (_, event) => {
					if (
						event.type !== 'error.platform.fetchUserSessions' &&
						event.type !== 'error.platform.filter'
					) {
						return undefined;
					}
					return event.data;
				}
			}),
			clearError: assign({
				error: (_, __) => undefined
			}),
			startProgress,
			endProgress
		},
		services: {
			fetchUserSessions: async (context, event) => {
				if (event.type !== LoadEvents.LOAD && event.type !== LoadEvents.LOADMORE) {
					throw new Error(
						`Invalid event: expected "${LoadEvents.LOAD} or ${LoadEvents.LOADMORE}", got "${event.type}"`
					);
				}
				try {
					const token = await getToken();
					const { cursor, limit } = context;
					const res = await fetch('/.netlify/functions/get-sessions', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ cursor, limit: limit + 1 })
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw new Error('No sessions found');
				}
			},
			filter: async (context) => {
				try {
					const token = await getToken();
					const { filterType, value } = context.filterData || {};
					const res = await fetch('/.netlify/functions/get-filtered-sessions', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ filterType, value })
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw error;
				}
			}
		},
		guards: {
			isEmpty: (context) => !context.sessions?.length,
			hasNextPage: (context) => context.hasNextPage,
			debounce: (_, event) => {
				assertEventType(event, 'FILTER');
				return event.data.debounce || false;
			}
		},
		delays: {
			DEBOUNCE_DELAY: () => (isTouchDevice() ? 800 : 450)
		}
	}
);
