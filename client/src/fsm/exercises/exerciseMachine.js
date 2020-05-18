import { Machine, assign } from 'xstate';
import { getData, getToken } from '@/js/utils.js';

const extractPrExecution = (executions, type) => {
	const sortedExecs = executions.sort((a, b) => b[type].amount - a[type].amount).sort((a, b) => a.reps - b.reps);
	return sortedExecs.length ? sortedExecs[0] : null;
};

const services = {
	getExercise: async (context, _) => {
		const queryName = 'getExerciseHistory';
		const query = {
			query: `
				query getExercise($exerciseId: ID!) {
					getExerciseHistory(exerciseId: $exerciseId) {
						name
						history {
							date
							session {
								_id
							}
							executions {
								_id
								sets
								reps
								time {
									amount
									unit
								}
								load {
									amount
									unit
								}
							}
						}
					}
				}
			`,
			variables: {
				exerciseId: context.exerciseId
			}
		};
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	extractExectutions: (context, _) => (callback, _) => {
		const executions = context.exercise.history.map(h => h.executions).flat();
		callback({ type: 'DONE', params: executions });
	},
	getPrData: (context, _) => (callback, _) => {
		let prExecution;
		const loadPrExec = extractPrExecution(context.executions, 'load');
		let timePrExec = extractPrExecution(context.executions, 'time');
		if (loadPrExec !== null && timePrExec !== null) {
			prExecution = loadPrExec;
		} else {
			prExecution = loadPrExec || timePrExec;
		}
		callback({ type: 'DONE', params: prExecution });
	},
	generatePrDisplay: (context, _) => (callback, _) => {
		let prDisplay;
		const prExec = context.prData;
		if (!prExec) {
			prDisplay = 'No personnal best set for this exercise yet.';
			callback({ type: 'DONE', params: prDisplay });
			return;
		}
		const sets = prExec.sets > 1 ? 'sets' : 'set';
		if (prExec.load.amount && prExec.time.amount) {
			prDisplay = `${prExec.load.amount} ${prExec.load.unit} for ${prExec.sets} ${sets} of ${prExec.time.amount} ${prExec.time.unit}`;
		} else if (prExec.load.amount) {
			prDisplay = `${prExec.load.amount} ${prExec.load.unit} for ${prExec.sets} ${sets} of ${prExec.reps} reps`;
		} else {
			prDisplay = `${prExec.sets} ${sets} of ${prExec.time.amount} ${prExec.time.unit}`;
		}
		callback({ type: 'DONE', params: prDisplay });
	}
};

const actions = {
	updateExercise: assign({
		exercise: (_, event) => event.data
	}),
	updateExecutions: assign({
		executions: (_, event) => event.params
	}),
	updatePrData: assign({
		prData: (_, event) => event.params
	}),
	updatePrDisplay: assign({
		prDisplay: (_, event) => event.params
	}),
	updateFetchError: assign({
		fetchError: (_, event) => event.data
	}),
	clearFetchError: assign({
		fetchError: ''
	})
};

export const exerciseMachine = exerciseId => {
	return Machine(
		{
			id: 'exercise',
			context: {
				exerciseId,
				exercise: null,
				executions: null,
				prData: null,
				prDisplay: '',
				fetchError: ''
			},
			initial: 'fetching',
			states: {
				fetching: {
					invoke: {
						src: 'getExercise',
						onDone: {
							target: 'computing',
							actions: ['updateExercise']
						},
						onError: {
							target: 'idle.error',
							actions: ['updateFetchError']
						}
					}
				},
				computing: {
					initial: 'extractingExecutions',
					states: {
						extractingExecutions: {
							invoke: {
								src: 'extractExectutions'
							},
							on: {
								DONE: {
									target: 'gettingPrData',
									actions: ['updateExecutions']
								}
							}
						},
						gettingPrData: {
							invoke: {
								src: 'getPrData'
							},
							on: {
								DONE: {
									target: 'generatingPrDisplay',
									actions: ['updatePrData']
								}
							}
						},
						generatingPrDisplay: {
							invoke: {
								src: 'generatePrDisplay'
							},
							on: {
								DONE: {
									target: '#idle',
									actions: ['updatePrDisplay']
								}
							}
						}
					}
				},
				idle: {
					id: 'idle',
					initial: 'normal',
					states: {
						normal: {},
						error: {}
					}
				}
			}
		},
		{
			services,
			actions
		}
	);
};
