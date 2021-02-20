import { assertEventType, getToken } from 'src/utils';
import { createMachine, sendParent, assign } from 'xstate';

interface FetchContext {
	body?: Record<string, any>;
	endpoint: string;
	controller?: AbortController;
}

type FetchEvent =
	| {
			type: 'done.invoke.fetchSrc';
			data: Record<string, any>;
	  }
	| { type: 'error.platform.fetchSrc'; data: Record<string, any> }
	| { type: 'CANCEL' };

type FetchState =
	| {
			value: 'fetching';
			context: FetchContext & {
				controller: AbortController;
			};
	  }
	| { value: 'done'; context: FetchContext }
	| { value: 'error'; context: FetchContext };

export const functionFetch = createMachine<FetchContext, FetchEvent, FetchState>(
	{
		id: 'functionFetch',
		initial: 'fetching',
		context: {
			body: undefined,
			endpoint: '',
			controller: undefined
		},
		states: {
			fetching: {
				entry: ['setController'],
				invoke: {
					id: 'fetchSrc',
					src: 'fetch',
					onDone: {
						target: 'done'
					},
					onError: {
						target: 'error',
						actions: ['notifyError']
					}
				},
				on: {
					CANCEL: {
						target: 'error',
						actions: ['abort']
					}
				}
			},
			done: {
				type: 'final',
				data: (_, event) => {
					assertEventType(event, 'done.invoke.fetchSrc');
					return event.data;
				}
			},
			error: {}
		}
	},
	{
		actions: {
			setController: assign({
				controller: (_, __) => new AbortController()
			}),
			abort: assign({
				controller: (context, event) => {
					assertEventType(event, 'CANCEL');
					console.log('CANCEL');
					const { controller } = context;
					if (controller) {
						controller.abort();
					}
					return undefined;
				}
			}),
			notifyError: sendParent((_, event) => {
				assertEventType(event, 'error.platform.fetchSrc');
				return { type: 'ERROR', data: event.data };
			})
		},
		services: {
			fetch: async (context) => {
				try {
					const token = await getToken();
					const { body, endpoint, controller } = context;
					const res = await fetch(`/.netlify/functions/${endpoint}`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(body || {}),
						signal: controller?.signal
					});
					return await res.json();
				} catch (error) {
					console.warn(error);
					throw error;
				}
			}
		}
	}
);
