import { Machine, assign, spawn, send } from 'xstate';
import { getData, getToken } from '@/assets/js/utils.js';
import { editExerciseMachine } from './editExerciseMachine';

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
	},
	deleteExercise: async (_, event) => {
		const queryName = 'deleteExercise';
		const query = {
			query: `
				mutation deleteExercise($id: ID!) {
					deleteExercise(exerciseId: $id) 
				}
			`,
			variables: {
				id: event.params.exercise._id
			}
		};
		try {
			const token = getToken();
			await getData(query, queryName, token);
			return event.params.id;
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
		newExercise: (_, event) => (event.params ? event.params.value : event.data)
	}),
	addNewExercise: assign({
		exercises: (context, _) => [context.newExercise, ...context.exercises]
	}),
	removeExercise: assign({
		exercises: (context, event) => {
			return context.exercises.filter(exercise => {
				return exercise._id !== event.params.exercise._id;
			});
		}
	}),
	clearNewExercise: assign({
		newExercise: ''
	}),
	updateFetchError: assign({
		fetchError: (_, event) => event.data.message
	}),
	updateSearchFilter: assign({
		searchFilter: (_, event) => event.params.value
	}),
	filterExercises: assign({
		filteredExercises: (context, _) => {
			return context.exercises.filter(exercise => {
				return exercise.name
					.trim()
					.toLowerCase()
					.includes(context.searchFilter.trim().toLowerCase());
			});
		}
	}),
	resetExercises: assign({
		filteredExercises: null
	})
};

const guards = {
	isInputEmpty: (context, _) => context.newExercise.trim().length === 0,
	isSearchFilterEmpty: (context, _) => context.searchFilter.trim().length === 0
};

export const exercisesMachine = Machine(
	{
		id: 'exercises',
		context: {
			filteredExercises: null,
			exercises: [],
			newExercise: '',
			editedExercise: null,
			searchFilter: '',
			fetchError: ''
		},
		initial: 'idle',
		states: {
			idle: {
				id: 'idle',
				on: {
					LOAD: 'fetching',
					CREATE: 'creating',
					DELETE: 'deleting',
					EDIT: 'editing',
					SEARCH_INPUT: {
						target: 'filtering',
						actions: ['updateSearchFilter']
					}
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
						on: {
							'': {
								target: '#idle',
								actions: ['addNewExercise', 'clearNewExercise']
							}
						}
					}
				}
			},
			deleting: {
				entry: ['removeExercise'],
				invoke: {
					src: 'deleteExercise',
					onDone: {
						target: 'idle'
					},
					onError: {
						target: 'idle'
					}
				}
			},
			editing: {
				entry: assign({
					editedExercise: (_, event) => {
						return spawn(editExerciseMachine(event.params.exercise));
					}
				}),
				on: {
					DONE_EDITING: {
						target: 'idle',
						actions: assign({
							editedExercise: null
						})
					}
				}
			},
			filtering: {
				on: {
					'': [
						{
							cond: 'isSearchFilterEmpty',
							target: 'idle',
							actions: ['resetExercises']
						},
						{
							target: 'idle',
							actions: ['filterExercises']
						}
					]
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
