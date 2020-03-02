import { Machine, assign } from 'xstate';

const services = {
	getSessions: async (_, event) => {
		const { query, queryName } = event.params;
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
			return {
				sessions,
				queryName,
				searchParams: {
					date: query.variables.date,
					dates: {
						fromDate: query.variables.fromDate,
						toDate: query.variables.toDate
					},
					sessionName: query.variables.title
				}
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	routeDashboard: () => {
		// router.push('/dashboard').catch(err => console.log(err));
	},
	routeSearch: () => {
		// router.push('/search-results').catch(err => console.log(err));
	},
	updateSessions: assign({ sessions: (_, event) => event.data.sessions }),
};

export const searchLogMachine = Machine(
	{
		id: 'searchLog',
		context: {
			sessions: [],
		},
		initial: 'idle',
		states: {
			idle: {
				on: {
					SEARCH: 'fetching'
				}
			},
			fetching: {
				invoke: {
					src: 'getSessions',
					onDone: {
						target: 'success',
						actions: ['updateSessions']
					},
					onError: {
						target: 'error'
					}
				}
			},
			success: {
				on: {
					SEARCH: 'fetching'
				}
			},
			error: {
				on: {
					SEARCH: 'fetching'
				}
			}
		}
	},
	{
		services,
		actions
	}
);
