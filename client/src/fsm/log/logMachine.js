import { Machine, assign } from 'xstate';
import {
	sessionRangeQuery,
	sessionNameQuery,
	sessionDateQuery,
	sessionPeriodQuery
} from '@/assets/js/session-queries.js';
import { getData, getToken, currentWeekDates, lastWeekDates } from '@/assets/js/utils.js';

const { currentMonday, currentSunday } = currentWeekDates();
const { lastMonday, lastSunday } = lastWeekDates();

const errors = {
	invalidDates: 'The second date must be later than the first',
	noResults: 'No sessions found',
	noMoreResults: 'No more sessions found',
	noResultsLastWeek: 'No sessions were logged last week',
	noResultsThisWeek: 'No sessions logged yet this week'
};

const services = {
	getCurrentWeek: async () => {
		const { query, queryName } = sessionPeriodQuery(currentMonday, currentSunday);
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			if (data.length === 0) {
				const error = new Error();
				error.message = errors.noResultsThisWeek;
				throw error;
			}
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	getLastWeek: async () => {
		const { query, queryName } = sessionPeriodQuery(lastMonday, lastSunday);
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			if (data.length === 0) {
				const error = new Error();
				error.message = errors.noResultsLastWeek;
				throw error;
			}
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	getSessionsRange: async (context, _) => {
		const { query, queryName } = sessionRangeQuery(context.rangeFrom, context.rangeTo);
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			if (data.length === 0) {
				const error = new Error();
				error.message = errors.noMoreResults;
				throw error;
			}
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	getSessionsByName: async (context, _) => {
		const { query, queryName } = sessionNameQuery(context.nameFilter);
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			if (data.length === 0) {
				const error = new Error();
				error.message = errors.noResults;
				throw error;
			}
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
			const data = await getData(query, queryName, token);
			if (data.length === 0) {
				const error = new Error();
				error.message = errors.noResults;
				throw error;
			}
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
			const data = await getData(query, queryName, token);
			if (data.length === 0) {
				const error = new Error();
				error.message = errors.noResults;
				throw error;
			}
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	deleteSession: async (_, event) => {
		const queryName = 'deleteSession';
		const query = {
			query: `
				mutation deleteSession($id: ID!) {
					deleteSession(sessionId: $id)
				}
			`,
			variables: {
				id: event.params.workoutId
			}
		};
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
	updateSessions: assign({
		sessions: (_, event) => event.data
	}),
	addSessions: assign({
		sessions: (context, event) => [...context.sessions, ...event.data]
	}),
	removeSession: assign({
		sessions: (context, event) => {
			return context.sessions.filter(session => session._id !== event.params.workoutId);
		}
	}),
	updateFetchError: assign({ fetchError: (_, event) => event.data.message }),
	clearError: assign({ error: '' }),
	updateRange: assign({
		rangeFrom: (context, _) => context.rangeFrom + context.range,
		rangeTo: (context, _) => context.rangeTo + context.range
	}),
	resetRange: assign({
		rangeFrom: 1,
		rangeTo: 10
	}),
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
	filterErrorInvalidDates: assign({ filterError: errors.invalidDates }),
	clearFilterError: assign({ filterError: '' })
};

const guards = {
	isPeriodEmpty: (context, _) =>
		context.periodFilter.from.trim().length === 0 && context.periodFilter.to.trim().length === 0,
	isMissingInput: (context, _) =>
		context.periodFilter.from.trim().length === 0 || context.periodFilter.to.trim().length === 0,
	isDatesInvalid: (context, _) => context.periodFilter.from > context.periodFilter.to,
	isNameEmpty: (context, _) => context.nameFilter.trim().length === 0,
	isDateEmpty: (context, _) => context.dateFilter.trim().length === 0,
	isNoreMoreResults: (_, event) => event.data.message === errors.noMoreResults
};

const delays = {
	DEBOUNCE: 500
};

export const logMachine = Machine(
	{
		id: 'log',
		context: {
			sessions: [],
			range: 10,
			rangeFrom: 1,
			rangeTo: 10,
			fetchError: '',
			nameFilter: '',
			dateFilter: '',
			periodFilter: {
				from: '',
				to: ''
			},
			filterError: ''
		},
		initial: 'idle',
		states: {
			idle: {
				id: 'idle',
				type: 'parallel',
				states: {
					fetch: {
						initial: 'success',
						states: {
							success: {},
							empty: {},
							filtering: {},
							error: {}
						}
					},
					nameFilter: {
						initial: 'valid',
						states: {
							valid: {},
							validating: {
								on: {
									'': {
										cond: 'isNameEmpty',
										target: 'invalid.empty'
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
										on: {
											'': '#fetching.load'
										}
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
											target: '#filtering.byDate'
										}
									]
								}
							},
							invalid: {
								initial: 'empty',
								states: {
									empty: {
										on: {
											'': '#fetching.load'
										}
									}
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
								states: {
									empty: {
										on: {
											'': '#fetching.load'
										}
									},
									missingInput: {},
									invalidDates: {
										entry: ['filterErrorInvalidDates']
									}
								}
							}
						}
					},
					delete: {
						initial: 'idle',
						states: {
							idle: {},
							deleting: {
								invoke: {
									src: 'deleteSession',
									onDone: {
										target: 'idle'
									},
									onError: {
										target: 'idle'
									}
								}
							}
						}
					}
				},
				on: {
					LOAD: {
						target: 'fetching'
					},
					LOAD_MORE: {
						target: 'fetching.loadmore',
						actions: ['updateRange']
					},
					LOAD_CURRENT_WEEK: {
						target: 'fetching.currentweek'
					},
					LOAD_LAST_WEEK: {
						target: 'fetching.lastweek'
					},
					DELETE: {
						target: 'idle.delete.deleting',
						actions: ['removeSession']
					},
					NAME_INPUT: {
						actions: ['updateNameFilter', 'clearFilterError'],
						target: 'idle.nameFilter.validating'
					},
					DATE_INPUT: {
						actions: ['updateDateFilter', 'clearFilterError'],
						target: 'idle.dateFilter.validating'
					},
					PERIOD_INPUT: {
						actions: ['updatePeriodFilter', 'clearFilterError'],
						target: 'idle.periodFilter.validating'
					}
				}
			},
			filtering: {
				id: 'filtering',
				initial: 'byName',
				states: {
					byName: {
						invoke: {
							src: 'getSessionsByName',
							onDone: [
								{
									target: '#idle.fetch.filtering',
									actions: ['updateSessions']
								}
							],
							onError: {
								target: '#idle.fetch.error',
								actions: ['updateFetchError']
							}
						}
					},
					byDate: {
						invoke: {
							src: 'getSessionsByDate',
							onDone: [
								{
									target: '#idle.fetch.filtering',
									actions: ['updateSessions']
								}
							],
							onError: {
								target: '#idle.fetch.error',
								actions: ['updateFetchError']
							}
						}
					},
					byPeriod: {
						invoke: {
							src: 'getSessionsFromTo',
							onDone: [
								{
									target: '#idle.fetch.filtering',
									actions: ['updateSessions']
								}
							],
							onError: {
								target: '#idle.fetch.error',
								actions: ['updateFetchError']
							}
						}
					}
				}
			},
			fetching: {
				id: 'fetching',
				initial: 'load',
				states: {
					load: {
						invoke: {
							src: 'getSessionsRange',
							onDone: {
								target: '#idle.fetch.success',
								actions: ['updateSessions']
							},
							onError: {
								target: '#idle.fetch.error',
								actions: ['updateFetchError']
							}
						}
					},
					loadmore: {
						invoke: {
							src: 'getSessionsRange',
							onDone: {
								target: '#idle.fetch.success',
								actions: ['addSessions']
							},
							onError: [
								{
									cond: 'isNoreMoreResults',
									target: '#idle.fetch.empty',
									actions: ['updateFetchError', 'resetRange']
								},
								{
									target: '#idle.fetch.error',
									actions: ['updateFetchError']
								}
							]
						}
					},
					currentweek: {
						invoke: {
							src: 'getCurrentWeek',
							onDone: {
								target: '#idle.fetch.success',
								actions: ['updateSessions']
							},
							onError: {
								target: '#idle.fetch.error',
								actions: ['updateFetchError']
							}
						}
					},
					lastweek: {
						invoke: {
							src: 'getLastWeek',
							onDone: {
								target: '#idle.fetch.success',
								actions: ['updateSessions']
							},
							onError: {
								target: '#idle.fetch.error',
								actions: ['updateFetchError']
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
		guards,
		delays
	}
);
