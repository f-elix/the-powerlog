import { Machine, assign } from 'xstate';
import { getData, getToken } from '@/assets/js/utils.js';

const services = {
	getAllExercises: async () => {
		const queryName = 'getAllExercises';
		const query = {
			query: `
            {
                getAllExercises{
                    name
                    _id
                }
            }
            `
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
	createNewExercise: async (context, _) => {
		const queryName = 'saveExercise';
		const query = {
			query: `
                mutation createExercise($data: ExerciseInput!) {
                    saveExercise(exerciseData: $data ) {
                        name
                        _id
                    }
                }
            `,
			variables: {
				data: {
					name: context.newExercise
				}
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
	}
};

const actions = {
	updateExercises: assign({
		exercises: (_, event) => event.data
	}),
	updateNewExercise: assign({
		newExercise: (_, event) => event.params ? event.params.value : event.data
	}),
	addNewExercise: assign({
		exercises: (context, _) => [context.newExercise, ...context.exercises]
	}),
	clearNewExercise: assign({
		newExercise: ''
	}),
	updateFetchError: assign({
		fetchError: (_, event) => event.data.message
	})
};

const guards = {
	isInputEmpty: (context, _) => context.newExercise.trim().length === 0
}

export const exercisesMachine = Machine(
	{
		id: 'exercises',
		context: {
			exercises: [],
			exercise: null,
			newExercise: '',
			fetchError: ''
		},
		initial: 'idle',
		states: {
			idle: {
				id: 'idle',
				on: {
					LOAD: 'fetching',
					CREATE: 'creating'
				}
			},
			fetching: {
				invoke: {
					src: 'getAllExercises',
					onDone: {
						target: 'idle',
						actions: ['updateExercises']
					},
					onError: {
						target: 'idle',
						actions: ['updateFetchError']
					}
				}
			},
			creating: {
				initial: 'idle',
				states: {
					idle: {
						on: {
							INPUT: {
								actions: ['updateNewExercise']
							},
							CREATE: [
								{
									cond: 'isInputEmpty',
									target: 'idle'
								},
								{
									target: 'uploading'
								}
							],
							DISCARD: {
								target: '#idle',
								actions: ['clearNewExercise']
							}
						}
					},
					uploading: {
						invoke: {
							src: 'createNewExercise',
							onDone: {
								target: 'success',
								actions: ['updateNewExercise']
							},
							onError: {
								target: 'idle',
								actions: ['updateFetchError']
							}
						}
					},
					success: {
						after: {
							1000: {
								target: '#idle',
								actions: ['addNewExercise', 'clearNewExercise']
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
		guards
	}
);
