import { createMachine, assign } from 'xstate';
import { assertEventType } from 'src/utils';
import type { Session } from 'types';

interface LogContext {
	sessions?: Session[];
	filteredSessions?: Session[];
	cursor?: string;
	limit: number;
	hasNextPage: boolean;
	error?: string;
}
type LogEvent =
	| {
			type: 'FILTER';
			data: {
				token?: string;
				filterType?: string;
				value?: Record<string, string | number>;
			};
	  }
	| { type: 'CLEAR' }
	| { type: 'LOAD'; data: { token?: string } }
	| { type: 'done.invoke.fetchUserSessions'; data: { sessions: Session[] } }
	| { type: 'error.platform.fetchUserSessions'; data: string }
	| { type: 'done.invoke.filter'; data: { sessions: Session[] } };

type LogState =
	| {
			value: 'idle';
			context: LogContext & {
				session: undefined;
				filteredSessions: undefined;
				cursor: undefined;
				limit: number;
				hasNextPage: true;
				error: undefined;
			};
	  }
	| {
			value: 'fetching';
			context: LogContext & {
				session?: Session[];
				filteredSessions?: Session[];
				cursor?: string;
				limit: number;
				hasNextPage: true | false;
				error: undefined;
			};
	  }
	| {
			value: 'loaded';
			context: LogContext;
	  }
	| {
			value: 'loaded.empty';
			context: LogContext & {
				session: [];
				filteredSessions: undefined;
				cursor: undefined;
				limit: number;
				hasNextPage: false;
				error: undefined;
			};
	  }
	| {
			value: 'loaded.normal';
			context: LogContext & {
				session: Session[];
				filteredSessions?: Session[];
				cursor: string;
				limit: number;
				hasNextPage: true;
				error: undefined;
			};
	  }
	| {
			value: 'loaded.end';
			context: LogContext & {
				session: Session[];
				filteredSessions?: Session[];
				cursor: string;
				limit: number;
				hasNextPage: false;
				error: undefined;
			};
	  }
	| {
			value: 'loaded.error';
			context: LogContext & {
				session: undefined;
				filteredSessions: undefined;
				cursor: undefined;
				limit: number;
				hasNextPage: true | false;
				error: string;
			};
	  }
	| {
			value: 'filtered';
			context: LogContext & {
				session?: Session[];
				filteredSessions: Session[];
				cursor: string;
				limit: number;
				hasNextPage: true;
				error: undefined;
			};
	  };

export const logMachine = createMachine<LogContext, LogEvent, LogState>(
	{
		id: 'log',
		context: {
			sessions: undefined,
			filteredSessions: undefined,
			cursor: undefined,
			limit: 10,
			error: undefined,
			hasNextPage: true
		},
		initial: 'idle',
		states: {
			idle: {
				on: {
					LOAD: {
						target: 'fetching'
					}
				}
			},
			fetching: {
				initial: 'sessions',
				states: {
					sessions: {
						invoke: {
							id: 'fetchUserSessions',
							src: 'fetchUserSessions',
							onDone: {
								target: '#log.loaded',
								actions: ['updateSessions']
							},
							onError: {
								target: '#log.loaded.error',
								actions: ['updateError']
							}
						}
					},
					filter: {
						invoke: {
							id: 'filter',
							src: 'filter',
							onDone: {
								target: '#log.filtered',
								actions: ['updateFilteredSessions']
							},
							onError: {
								target: '#log.loaded.last'
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
							LOAD: {
								target: '#log.fetching'
							}
						}
					},
					end: {},
					error: {},
					last: {
						type: 'history'
					}
				},
				on: {
					FILTER: {
						target: 'fetching.filter'
					}
				}
			},
			filtered: {
				on: {
					CLEAR: {
						target: 'loaded.last',
						actions: ['clearFilteredSessions', 'clearFilters']
					}
				}
			}
		}
	},
	{
		actions: {
			updateSessions: assign((context, event) => {
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
				filteredSessions: (_, event) => {
					assertEventType(event, 'done.invoke.filter');
					return event.data.sessions;
				}
			}),
			clearFilteredSessions: assign({
				filteredSessions: (_, __) => undefined
			}),
			clearFilters: () => {
				const filterCtn = <HTMLDivElement>document.querySelector('#filters');
				if (!filterCtn) {
					return;
				}
				filterCtn.querySelectorAll('input').forEach((i) => {
					const input = i;
					input.value = '';
				});
			},
			updateError: assign({
				error: (_, event) => {
					assertEventType(event, 'error.platform.fetchUserSessions');
					return event.data;
				}
			}),
			clearError: assign({
				error: (_, __) => undefined
			})
		},
		services: {
			fetchUserSessions: async (context, event) => {
				assertEventType(event, 'LOAD');
				try {
					const { cursor, limit } = context;
					const { token } = event.data;
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
			filter: async (_, event) => {
				assertEventType(event, 'FILTER');
				try {
					const { token, filterType, value } = event.data;
					const res = await fetch('/.netlify/functions/filter-sessions', {
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
					throw new Error('No sessions found');
				}
			}
		},
		guards: {
			isEmpty: (context) => !context.sessions,
			hasNextPage: (context) => context.hasNextPage
		}
	}
);
