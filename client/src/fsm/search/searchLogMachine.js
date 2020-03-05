import { Machine, assign } from 'xstate';

const invalidDatesError = 'The second date must be later than the first';

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
			return sessions;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const guards = {
	isMissingInput: (context, _) =>
		context.periodFilter.from.trim().length === 0 || context.periodFilter.to.trim().length === 0,
	isDatesInvalid: (context, _) => context.periodFilter.from > context.periodFilter.to,
	isNameEmpty: (context, _) => context.nameFilter.trim().length === 0,
	isDateEmpty: (context, _) => context.dateFilter.trim().length === 0,
	isLoadMore: (_, event) => console.log(event),
	alreadyHasSessions: (context, _) => context.sessions.length > 0
};

const actions = {
	updateSessions: assign({ sessions: (_, event) => event.data }),
	addSessions: assign({ sessions: (context, event) => [...context.sessions, ...event.data] }),
	clearSessions: assign({ sessions: [] }),
	updateFetchError: assign({ fetchError: (_, event) => event.data }),
	filterErrorInvalidDates: assign({ filterError: invalidDatesError }),
	clearFilterError: assign({ filterError: null }),
	updateNameFilter: assign({ nameFilter: (_, event) => event.params.value }),
	updateDateFilter: assign({ dateFilter: (_, event) => event.params.value }),
	updatePeriodFilter: assign({
		periodFilter: (context, event) => {
			return { ...context.periodFilter, ...event.params.value };
		}
	})
};

export const searchLogMachine = Machine(
	{
		id: 'searchLog',
		context: {
			sessions: [],
			fetchError: '',
			filterError: '',
			nameFilter: '',
			dateFilter: '',
			periodFilter: {
				from: '',
				to: ''
			}
		},
		initial: 'idle',
		states: {
			idle: {
				id: 'idle',
				type: 'parallel',
				on: {
					NAME_INPUT: [
						{
							actions: ['updateNameFilter', 'clearFilterError'],
							cond: 'isNameEmpty',
							target: 'idle.nameFilter.invalid.empty'
						},
						{
							target: 'fetching'
						}
					],
					DATE_INPUT: [
						{
							actions: ['updateDateFilter', 'clearFilterError'],
							cond: 'isDateEmpty',
							target: 'idle.dateFilter.invalid.empty'
						},
						{
							target: 'fetching'
						}
					],
					PERIOD_INPUT: [
						{
							actions: ['updatePerioFilter', 'clearFilterError'],
							cond: 'isMissingInput',
							target: 'idle.periodFilter.invalid.missingInput'
						},
						{
							cond: 'isDatesInvalid',
							target: 'idle.periodFilter.invalid.invalidDates'
						},
						{
							target: 'fetching'
						}
					],
					SEARCH: 'fetching',
					LOAD_MORE: {
						cond: 'alreadyHasSessions',
						target: 'fetching.loadmore'
					}
				},
				states: {
					nameFilter: {
						initial: 'valid',
						states: {
							valid: {},
							invalid: {
								initial: 'empty',
								states: {
									empty: {}
								}
							}
						}
					},
					dateFilter: {
						initial: 'valid',
						states: {
							valid: {},
							invalid: {
								initial: 'empty',
								states: {
									empty: {}
								}
							}
						}
					},
					periodFilter: {
						initial: 'valid',
						states: {
							valid: {},
							invalid: {
								initial: 'missingInput',
								states: {
									missingInput: {},
									invalidDates: {
										entry: ['filterErrorInvalidDates']
									}
								}
							}
						}
					}
				}
			},
			fetching: {
				initial: 'firstload',
				states: {
					firstload: {
						invoke: {
							src: 'getSessions',
							onDone: [
								{
									target: '#idle',
									actions: ['updateSessions']
								}
							],
							onError: {
								target: '#error',
								actions: ['updateFetchError', 'clearSessions']
							}
						}
					},
					loadmore: {
						invoke: {
							src: 'getSessions',
							onDone: [
								{
									target: '#idle',
									actions: ['addSessions']
								}
							],
							onError: {
								target: '#error',
								actions: ['updateFetchError', 'clearSessions']
							}
						}
					}
				}
			},
			error: {
				id: 'error',
				on: {
					SEARCH: 'fetching'
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
