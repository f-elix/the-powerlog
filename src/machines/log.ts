import { createMachine, assign } from 'xstate';
import type { EventObject } from 'xstate';
import type { UserResponse } from 'types';

function assertEventType<TE extends EventObject, TType extends TE['type']>(
	event: TE,
	eventType: TType
): asserts event is TE & { type: TType } {
	if (event.type !== eventType) {
		throw new Error(`Invalid event: expected "${eventType}", got "${event.type}"`);
	}
}

interface LogContext {
	user?: UserResponse;
	error?: string;
}

type LogState =
	| {
			value: 'idle.normal';
			context: LogContext & {
				user: undefined;
				error: undefined;
			};
	  }
	| {
			value: 'idle.error';
			context: LogContext & {
				user: undefined;
				error: string;
			};
	  }
	| {
			value: 'fetchingUser';
			context: LogContext & {
				user: undefined;
				error: undefined;
			};
	  }
	| {
			value: 'loaded';
			context: LogContext & {
				user: UserResponse;
				error: undefined;
			};
	  };

type LogEvent =
	| { type: 'LOAD'; data: { token?: string } }
	| { type: 'done.invoke.fetchUser'; data: UserResponse }
	| { type: 'error.platform.fetchUser'; data: string };

export const logMachine = createMachine<LogContext, LogEvent, LogState>(
	{
		id: 'log',
		context: {
			user: undefined,
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
						target: 'fetchingUser'
					}
				}
			},
			fetchingUser: {
				id: 'fetchUser',
				invoke: {
					src: 'fetchUser',
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
						target: 'fetchingUser'
					}
				}
			}
		}
	},
	{
		actions: {
			updateUser: assign({
				user: (context, event) => {
					assertEventType(event, 'done.invoke.fetchUser');
					// const currentSessions = context.user?.sessions.data || [];
					// const loadedSessions = event.data.sessions.data;
					// const cursor = event.data.sessions.after;
					// const user = {
					// 	...event.data,
					// 	sessions: {
					// 		data: [...currentSessions, ...loadedSessions],
					// 		after: cursor
					// 	}
					// };
					return context.user;
				}
			}),
			updateError: assign({
				error: (context, event) => {
					assertEventType(event, 'error.platform.fetchUser');
					return event.data;
				}
			}),
			clearError: assign({
				error: (context, event) => undefined
			})
		},
		services: {
			fetchUser: async (context, event) => {
				assertEventType(event, 'LOAD');
				return new Promise((resolve) => resolve('temp'));
				// try {
				// 	const { token } = event.data;
				// 	const cursor = context.user?.sessions?.after || null;
				// 	const res = await fetch('/.netlify/functions/get-user', {
				// 		method: 'POST',
				// 		headers: {
				// 			Authorization: `Bearer ${token}`
				// 		},
				// 		body: JSON.stringify({ cursor })
				// 	});
				// 	const data = await res.json();
				// 	return data;
				// } catch (error) {
				// 	console.warn(error);
				// 	throw new Error('No user found');
				// }
			}
		}
	}
);
