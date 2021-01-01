import { createMachine, assign } from 'xstate';
import type { EventObject } from 'xstate';
import type { Session } from 'types';

function assertEventType<TE extends EventObject, TType extends TE['type']>(
	event: TE,
	eventType: TType
): asserts event is TE & { type: TType } {
	if (event.type !== eventType) {
		throw new Error(`Invalid event: expected "${eventType}", got "${event.type}"`);
	}
}

interface LogContext {
	sessions?: Session[];
	error?: string;
}

type LogState =
	| {
			value: 'idle.normal';
			context: LogContext & {
				session: undefined;
				error: undefined;
			};
	  }
	| {
			value: 'idle.error';
			context: LogContext & {
				session: undefined;
				error: string;
			};
	  }
	| {
			value: 'fetchingSessions';
			context: LogContext & {
				session: undefined;
				error: undefined;
			};
	  }
	| {
			value: 'loaded';
			context: LogContext & {
				session: Session[];
				error: undefined;
			};
	  };

type LogEvent =
	| { type: 'LOAD'; data: { token?: string } }
	| { type: 'done.invoke.fetchUserSessions'; data: { sessions: Session[] } }
	| { type: 'error.platform.fetchUserSessions'; data: string };

export const logMachine = createMachine<LogContext, LogEvent, LogState>(
	{
		id: 'log',
		context: {
			sessions: undefined,
			error: undefined
		},
		initial: 'idle',
		states: {
			idle: {
				initial: 'normal',
				states: {
					normal: {},
					error: {
						exit: ['clearError']
					}
				},
				on: {
					LOAD: {
						target: 'fetchingSessions'
					}
				}
			},
			fetchingSessions: {
				id: 'fetchUserSessions',
				invoke: {
					src: 'fetchUserSessions',
					onDone: {
						target: 'loaded',
						actions: ['updateUser']
					},
					onError: {
						target: 'idle.error',
						actions: ['updateError']
					}
				}
			},
			loaded: {
				on: {
					LOAD: {
						target: 'fetchingSessions'
					}
				}
			}
		}
	},
	{
		actions: {
			updateUser: assign({
				sessions: (context, event) => {
					assertEventType(event, 'done.invoke.fetchUserSessions');
					const currentSessions = context.sessions || [];
					const loadedSessions = event.data.sessions || [];
					return [...currentSessions, ...loadedSessions];
				}
			}),
			updateError: assign({
				error: (context, event) => {
					assertEventType(event, 'error.platform.fetchUserSessions');
					return event.data;
				}
			}),
			clearError: assign({
				error: (context, event) => undefined
			})
		},
		services: {
			fetchUserSessions: async (context, event) => {
				assertEventType(event, 'LOAD');
				try {
					const { token } = event.data;
					const res = await fetch('/.netlify/functions/get-sessions', {
						headers: {
							Authorization: `Bearer ${token}`
						}
					});
					const sessions = await res.json();
					return sessions;
				} catch (error) {
					console.warn(error);
					throw new Error('No user found');
				}
			}
		}
	}
);
