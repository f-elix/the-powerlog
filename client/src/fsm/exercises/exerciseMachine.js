import { Machine, assign } from 'xstate';
import { getData, getToken } from '@/js/utils.js';

const services = {
	getExercise: async (context, _) => {
		const queryName = 'getExerciseHistory';
		const query = {
			query: `
				query getExercise($exerciseId: ID!) {
					getExerciseHistory(exerciseId: $exerciseId) {
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
			console.log(data);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	updateExercise: assign({
		exercise: (_, event) => event.data
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
				fetchError: ''
			},
			initial: 'fetching',
			states: {
				fetching: {
					invoke: {
						src: 'getExercise',
						onDone: {
							target: 'idle',
							actions: ['updateExercise']
						},
						onError: {
							target: 'idle.error',
							actions: ['updateFetchError']
						}
					}
				},
				idle: {
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
