import { Machine, assign } from 'xstate';
import { sessionNameQuery } from '@/assets/js/session-queries.js';

const invalidDatesError = 'The second date must be later than the first';

const services = {
	getSessionsByTitle: async (context, _) => {
		const { query, queryName } = sessionNameQuery(context.nameFilter);
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
	isDateEmpty: (context, _) => context.dateFilter.trim().length === 0
};

const actions = {
	updateSessions: assign({ sessions: (_, event) => event.data }),
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

const delays = {
	DEBOUNCE: 500
};

export const filterLogMachine = Machine(
	{
		id: 'filterLog',
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
							target: 'idle.nameFilter.validating'
						}
					],
					DATE_INPUT: [
						{
							actions: ['updateDateFilter', 'clearFilterError'],
							target: 'idle.dateFilter.validating'
						}
					],
					PERIOD_INPUT: [
						{
							actions: ['updatePeriodFilter', 'clearFilterError'],
							target: 'idle.periodFilter.validating'
						}
					]
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
										}
									],
									NAME_INPUT: {
										actions: ['updateNameFilter', 'clearFilterError'],
										target: 'validating'
									}
								},
								after: {
									DEBOUNCE: '#filtering.byName'
								}
							},
							invalid: {
								initial: 'empty',
								states: {
									empty: {
										entry: ['clearSessions']
									}
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
											target: '#filtering'
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
											target: 'invalid.invalidDates'
										},
										{
											target: '#filtering'
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
			filtering: {
				id: 'filtering',
				states: {
					byName: {
						invoke: {
							src: 'getSessionsByTitle',
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
					byDate: {},
					byPeriod: {}
				}
			}
		}
	},
	{
		actions,
		services,
		guards,
		delays
	}
);
