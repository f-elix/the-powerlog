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
                mutation createExercise($name: String!) {
                    saveExercise(exerciseData: $name ) {
                        name
                        _id
                    }
                }
            `,
			variables: {
				name: context.newExercise
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
		newExercise: (_, event) => event.params.value
	}),
	clearNewExercise: assign({
		newExercise: ''
	})
};

export const exercisesMachine = Machine(
	{
		id: 'exercises',
		context: {
			exercises: [],
			exercise: null,
			newExercise: ''
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
						target: 'idle'
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
							CREATE: {
								target: 'uploading'
							},
							DISCARD: {
								target: '#idle',
								actions: ['clearNewExercise']
							}
						}
					},
					uploading: {
						invoke: {
							src: 'createExercise',
							onDone: {
								target: '#idle',
								actions: ['clearNewExercise']
							},
							onError: {
								target: '#idle'
							}
						}
					}
				}
			}
		}
	},
	{
		actions,
		services
	}
);
