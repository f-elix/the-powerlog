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
	alreadyHasSessions: (context, _) => context.sessions.length > 0
};

const actions = {
	updateSessions: assign({ sessions: (_, event) => event.data }),
	addSessions: assign({ sessions: (context, event) => [...context.sessions, ...event.data] }),
	updateFilteredSessions: assign({ filteredSessions: (_, event) => event.data }),
	clearSessions: assign({ sessions: [] }),
	updateFetchError: assign({ fetchError: (_, event) => event.data.message }),
	clearFetchError: assign({ fetchError: '' }),
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
			filteredSessions: [],
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
							target: 'idle.nameFilter.validating'
						},
					],
					DATE_INPUT: [
						{
							actions: ['updateDateFilter', 'clearFilterError'],
							target: 'idle.dateFilter.validating'
						},

					],
					PERIOD_INPUT: [
						{
							actions: ['updatePeriodFilter', 'clearFilterError'],
							target: 'idle.periodFilter.validating'
						}
					],
					SEARCH: {
						target: 'fetching',
						actions: ['clearFetchError']
					},
					LOAD_MORE: {
						cond: 'alreadyHasSessions',
						target: 'fetching.loadingmore',
						actions: ['clearFetchError']
					}
				},
				states: {
					nameFilter: {
						initial: 'valid',
						states: {
							valid: {},
							validating: {
								on: {
									'': [
										{
											cond: 'isNameEmpty',
											target: 'invalid.empty'
										},
										{
											target: '#fetching'
										}
									]
								}
							},
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
							validating: {
								on: {
									'': [
										{
											cond: 'isDateEmpty',
											target: 'invalid.empty'
										},
										{
											target: '#fetching'
										}
									]
								}
							},
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
							validating: {
								on: {
									'': [
										{
											cond: 'isMissingInput',
											target: 'invalid.missingInput'
										},
										{
											cond: 'isDatesInvalid',
											target: 'invalid.invalidDates',
										},
										{
											target: '#fetching'
										}
									]
								}
							},
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
				id: 'fetching',
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
								actions: ['updateFetchError', 'clearSessions']
							}
						}
					},
					loadingmore: {
						invoke: {
							src: 'getSessions',
							onDone: [
								{
									target: '#idle',
									actions: ['addSessions']
								}
							],
							onError: {
								target: '#idle',
								actions: ['updateFetchError', 'clearSessions']
							}
						}
					},
					filtering: {
						invoke: {
							src: 'getSessions',
							onDone: [
								{
									target: '#idle',
									actions: ['updateFilteredSessions']
								}
							],
							onError: {
								target: '#idle',
								actions: ['updateFetchError', 'clearSessions']
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
