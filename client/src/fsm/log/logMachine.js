import { Machine, assign } from 'xstate';
import { sessionRangeQuery } from '@/assets/js/session-queries.js';
import { getData, getToken } from '@/assets/js/utils.js';

const services = {
	getSessionsRange: async (context, _) => {
		const { query, queryName } = sessionRangeQuery(context.rangeFrom, context.rangeTo);
		try {
			const token = getToken();
			const data = getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	updateSessions: assign({ sessions: (_, event) => event.data }),
	addSessions: assign({ sessions: (context, event) => [...context.sessions, ...event.data] }),
	clearSessions: assign({ sessions: [] }),
	updateError: assign({ error: (_, event) => event.data.message }),
	clearError: assign({ error: '' }),
	updateRange: assign({
		rangeFrom: (context, _) => context.rangeFrom + context.range,
		rangeTo: (context, _) => context.rangeTo + context.range
	})
};

export const logMachine = Machine(
	{
		id: 'log',
		context: {
			sessions: [],
			error: '',
			range: 10,
			rangeFrom: 1,
			rangeTo: 10
		},
		initial: 'fetching',
		states: {
			idle: {
				initial: 'normal',
				states: {
					normal: {},
					error: {}
				},
				on: {
					LOAD_MORE: {
						target: 'fetching',
						actions: ['clearError']
					}
				}
			},
			fetching: {
				invoke: {
					src: 'getSessionsRange',
					onDone: [
						{
							target: 'idle',
							actions: ['addSessions', 'updateRange']
						}
					],
					onError: {
						target: 'idle',
						actions: ['updateError']
					}
				}
			}
		}
	},
	{
		services,
		actions
	}
);
