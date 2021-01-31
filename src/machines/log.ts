import { createMachine, assign } from 'xstate';
import { assertEventType, getToken } from 'src/utils';
import type { Session } from 'types';

interface LogContext {
	sessions?: Session[];
	cursor?: string;
	limit: number;
	hasNextPage: boolean;
	error?: string;
}

enum LoadEvents {
	LOAD = 'LOAD',
	LOADMORE = 'LOAD_MORE'
}

type LogEvent =
	| { type: LoadEvents.LOAD }
	| { type: LoadEvents.LOADMORE }
	| { type: 'done.invoke.fetchUserSessions'; data: { sessions: Session[] } }
	| { type: 'error.platform.fetchUserSessions'; data: string };

type LogState =
	| {
			value: 'idle';
			context: LogContext & {
				session: undefined;
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
								target: '#log.fetching'
							}
						}
					},
					end: {},
					error: {}
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
			}
		},
		guards: {
			isEmpty: (context) => !context.sessions?.length,
			hasNextPage: (context) => context.hasNextPage
		}
	}
);
