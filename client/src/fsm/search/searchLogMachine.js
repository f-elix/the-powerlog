import { Machine, assign } from 'xstate';
import { sessionRangeQuery } from '@/assets/js/session-queries.js';

const sessions = async (query, queryName) => {
	const token = localStorage.getItem(process.env.APP_TOKEN);
	try {
		const res = await fetch(process.env.APP_API, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: token
			},
			body: JSON.stringify(query)
		});
		const data = await res.json();
		if (data.errors) {
			const error = new Error();
			error.message = data.errors[0].message;
			error.statusCode = data.errors[0].extensions.exception.statusCode;
			throw error;
		}
		const sessions = data.data[queryName];
		if (!sessions.length) {
			const error = new Error();
			error.message = 'No results found';
			error.statusCode = 404;
			throw error;
		}
		return sessions;
	} catch (err) {
		console.log(err);
		throw err;
	}
};

const services = {
	getSessions: async (_, event) => {
		const { query, queryName } = event.params;
		return sessions(query, queryName);
	},
	getSessionsRange: async (context, _) => {
		const { query, queryName } = sessionRangeQuery(context.rangeFrom, context.rangeTo);
		return sessions(query, queryName);
	}
};

const guards = {
	alreadyHasSessions: (context, _) => context.sessions.length > 0
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

export const searchLogMachine = Machine(
	{
		id: 'searchLog',
		context: {
			sessions: [],
			error: '',
			range: 10,
			rangeFrom: 1,
			rangeTo: 10
		},
		initial: 'idle',
		states: {
			idle: {
				id: 'idle',
				on: {
					SEARCH: {
						target: 'fetching',
						actions: ['clearError']
					},
					LOAD_MORE: {
						// cond: 'alreadyHasSessions',
						target: 'fetching.loadingmore',
						actions: ['clearError']
					}
				}
			},
			fetching: {
				initial: 'loading',
				states: {
					loading: {
						invoke: {
							src: 'getSessions',
							onDone: [
								{
									target: '#idle',
									actions: ['updateSessions']
								}
							],
							onError: {
								target: '#idle',
								actions: ['updateError', 'clearSessions']
							}
						}
					},
					loadingmore: {
						invoke: {
							src: 'getSessionsRange',
							onDone: [
								{
									target: '#idle',
									actions: ['addSessions', 'updateRange']
								}
							],
							onError: {
								target: '#idle',
								actions: ['updateError']
							}
						}
					}
				}
			}
		}
	},
	{
		services,
		actions,
		guards
	}
);
