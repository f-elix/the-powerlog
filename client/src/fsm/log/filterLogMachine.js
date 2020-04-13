import { Machine, assign, spawn } from 'xstate';
import { filterDisplayMachine } from './filterDisplayMachine.js';
import { sessionNameQuery, sessionDateQuery, sessionPeriodQuery } from '@/assets/js/session-queries.js';
import { getData, getToken } from '@/assets/js/utils.js';

const invalidDatesError = 'The second date must be later than the first';

const services = {
	getSessionsByTitle: async (context, _) => {
		const { query, queryName } = sessionNameQuery(context.nameFilter);
		try {
			const token = getToken();
			const data = getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	getSessionsByDate: async (context, _) => {
		const { query, queryName } = sessionDateQuery(context.dateFilter);
		try {
			const token = getToken();
			const data = getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	getSessionsFromTo: async (context, _) => {
		const { query, queryName } = sessionPeriodQuery(context.periodFilter.from, context.periodFilter.to);
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

const guards = {
	isPeriodEmpty: (context, _) =>
		context.periodFilter.from.trim().length === 0 && context.periodFilter.to.trim().length === 0,
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
	clearFilterError: assign({ filterError: '' }),
	updateNameFilter: assign({ nameFilter: (_, event) => event.params.value }),
	updateDateFilter: assign({ dateFilter: (_, event) => event.params.value }),
	updatePeriodFilter: assign({
		periodFilter: (context, event) => {
			return { ...context.periodFilter, ...event.params.value };
		}
	}),
	resetFilters: assign({
		nameFilter: '',
		dateFilter: '',
		periodFilter: {
			from: '',
			to: ''
		}
	}),
	setFilterDisplay: assign({
		filterDisplay: () => spawn(filterDisplayMachine, { sync: true })
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
			},
			filterDisplay: null
		},
		initial: 'init',
		states: {
			init: {
				entry: ['setFilterDisplay'],
				on: {
					'': 'idle'
				}
			},
			idle: {
				id: 'idle',
				type: 'parallel',
				on: {
					NAME_INPUT: [
						{
							actions: ['updateNameFilter', 'clearFilterError', 'clearFetchError'],
							target: 'idle.nameFilter.validating'
						}
					],
					DATE_INPUT: [
						{
							actions: ['updateDateFilter', 'clearFilterError', 'clearFetchError'],
							target: 'idle.dateFilter.validating'
						}
					],
					PERIOD_INPUT: [
						{
							actions: ['updatePeriodFilter', 'clearFilterError', 'clearFetchError'],
							target: 'idle.periodFilter.validating'
						}
					],
					DISPLAY_CHANGE: {
						actions: ['clearFilterError', 'resetFilters']
					}
				},
				states: {
					nameFilter: {
						initial: 'valid',
						states: {
							valid: {
								entry: ['clearFilterError']
							},
							validating: {
								on: {
									'': {
										cond: 'isNameEmpty',
										target: 'invalid.empty'
									},
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
								on: {
									DISPLAY_CHANGE: 'valid'
								},
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
							valid: {
								entry: ['clearFilterError']
							},
							validating: {
								on: {
									'': [
										{
											cond: 'isDateEmpty',
											target: 'invalid.empty'
										},
										{
											target: '#filtering.byDate'
										}
									]
								}
							},
							invalid: {
								initial: 'empty',
								on: {
									DISPLAY_CHANGE: 'valid'
								},
								states: {
									empty: {
										entry: ['clearSessions']
									}
								}
							}
						}
					},
					periodFilter: {
						initial: 'valid',
						states: {
							valid: {
								entry: ['clearFilterError']
							},
							validating: {
								on: {
									'': [
										{
											cond: 'isPeriodEmpty',
											target: 'invalid.empty'
										},
										{
											cond: 'isMissingInput',
											target: 'invalid.missingInput'
										},
										{
											cond: 'isDatesInvalid',
											target: 'invalid.invalidDates'
										},
										{
											target: '#filtering.byPeriod'
										}
									]
								}
							},
							invalid: {
								initial: 'empty',
								on: {
									DISPLAY_CHANGE: 'valid'
								},
								states: {
									empty: {
										entry: ['clearSessions']
									},
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
					byDate: {
						invoke: {
							src: 'getSessionsByDate',
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
					byPeriod: {
						invoke: {
							src: 'getSessionsFromTo',
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
					}
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
