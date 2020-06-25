import { Machine, assign, spawn, send, sendParent } from 'xstate';
import { editWorkoutExerciseMachine } from './editWorkoutExerciseMachine';
import { getData, getToken } from '@/js/utils.js';

const reorder = (array, from, to) => {
	const reorderedArray = array;
	reorderedArray.splice(to, 0, reorderedArray.splice(from, 1)[0]);
	return reorderedArray;
};

const today = () => {
	const date = new Date();
	const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
	const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
	const formattedDate = `${date.getFullYear()}-${month}-${day}`;
	return formattedDate;
};

const emptyWorkout = {
	date: today(),
	name: '',
	notes: '',
	instructions: '',
	exercises: []
};

const services = {
	saveTemplate: async (context, _) => {
		const data = {
			_id: context.workout._id,
			name: context.workout.name,
			instructions: context.workout.instructions,
			exercises: context.workout.exercises
		};
		const queryName = 'saveTemplate';
		const query = {
			query: `
				mutation saveTemplate($data: TemplateInput!) {
					saveTemplate(templateData: $data) {
						_id
					}
				}
			`,
			variables: {
				data
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
	saveSession: async (context, _) => {
		const data = {
			_id: context.workout._id,
			date: context.workout.date,
			name: context.workout.name,
			notes: context.workout.notes,
			templateInstructions: context.workout.instructions,
			exercises: context.workout.exercises
		};
		const queryName = 'saveSession';
		const query = {
			query: `
				mutation saveSession($data: SessionInput!) {
					saveSession(sessionData: $data) {
						_id
					}
				}
			`,
			variables: {
				data: data
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
	getTemplate: async (_, event) => {
		const queryName = 'getTemplateById';
		const query = {
			query: `
				query getTemplate($id: ID!) {
					getTemplateById(templateId: $id) {
                        _id
						name
						instructions
                        exercises {
							_id
                            movements {
                                exercise {
                                    _id
                                    name
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
				}
			`,
			variables: {
				id: event.params.templateId
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
	},
	getExerciseHistory: async (_, event) => {
		const queryName = 'getLastExerciseHistory';
		const query = {
			query: `
				query getExercise($exerciseId: ID!) {
					getLastExerciseHistory(exerciseId: $exerciseId) {
						name
						date
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
			`,
			variables: {
				exerciseId: event.params.exerciseId
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
	updateWorkoutDate: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			updatedWorkout.date = event.params.value;
			return updatedWorkout;
		}
	}),
	updateWorkoutName: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			updatedWorkout.name = event.params.value;
			return updatedWorkout;
		}
	}),
	updateWorkoutNotes: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			updatedWorkout.notes = event.params.value;
			return updatedWorkout;
		}
	}),
	updateWorkoutInstructions: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			updatedWorkout.instructions = event.params.value;
			return updatedWorkout;
		}
	}),
	updateWorkoutWithTemplate: assign({
		workout: (context, event) => {
			const updatedWorkout = {
				...context.workout,
				name: event.data.name,
				exercises: event.data.exercises,
				instructions: event.data.instructions
			};
			return updatedWorkout;
		}
	}),
	spawnEditedExercise: assign({
		editedExercise: (_, event) => {
			if (event.type === 'EDIT_EXERCISE') {
				return spawn(editWorkoutExerciseMachine(event.params.exercise));
			} else {
				return spawn(editWorkoutExerciseMachine());
			}
		}
	}),
	addWorkoutExercise: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			updatedWorkout.exercises = [...context.workout.exercises, event.exercise];
			return updatedWorkout;
		}
	}),
	updateWorkoutExercise: assign({
		workout: (context, event) => {
			const updatedExerciseIndex = context.workout.exercises.findIndex(e => e._id === event.exercise._id);
			const updatedExercises = context.workout.exercises;
			updatedExercises[updatedExerciseIndex] = event.exercise;
			const updatedWorkout = context.workout;
			updatedWorkout.exercises = updatedExercises;
			return updatedWorkout;
		}
	}),
	clearEditedExercise: assign({
		editedExercise: null
	}),
	updateExerciseHistory: assign({
		exerciseHistory: (_, event) => event.data
	}),
	clearExerciseHistory: assign({
		exerciseHistory: null
	}),
	deleteExercise: assign({
		workout: (context, event) => {
			const { exerciseId } = event.params;
			const updatedExercises = context.workout.exercises.filter(ex => ex._id !== exerciseId);
			const updatedWorkout = context.workout;
			updatedWorkout.exercises = updatedExercises;
			return updatedWorkout;
		}
	}),
	deleteExecution: assign({
		workout: (context, event) => {
			const { exercise, movement, execution } = event.params;
			const exerciseIndex = context.workout.exercises.findIndex(e => e._id === exercise._id);
			const movementIndex = exercise.movements.findIndex(m => m._id === movement._id);
			const updatedExecutions = movement.executions.filter(e => e._id !== execution._id);
			const updatedWorkout = context.workout;
			updatedWorkout.exercises[exerciseIndex].movements[movementIndex].executions = updatedExecutions;
			return updatedWorkout;
		}
	}),
	updateNameError: assign({
		nameError: 'Name is required'
	}),
	clearNameError: assign({
		nameError: ''
	}),
	forwardToEditedExercise: send((_, event) => event, {
		to: context => context.editedExercise
	}),
	setDrag: assign({
		pointerx: (_, event) => event.params.x,
		pointery: (_, event) => event.params.y,
		draggedIndex: (_, event) => event.params.draggedIndex,
		draggedElHeight: (_, event) => event.params.draggedElHeight,
		draggedId: (_, event) => event.params.draggedId
	}),
	updateCoords: assign({
		x: (context, event) => event.params.x - context.pointerx,
		y: (context, event) => event.params.y - context.pointery
	}),
	clearDragging: assign({
		x: 0,
		y: 0,
		pointerx: 0,
		pointery: 0,
		draggedIndex: null,
		draggedElHeight: null,
		draggedId: null
	}),
	updateExerciseOrder: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			const draggedIndex = context.draggedIndex;
			const hoveredIndex = event.params.hoveredIndex;
			updatedWorkout.exercises = reorder(context.workout.exercises, draggedIndex, hoveredIndex);
			return updatedWorkout;
		},
		pointery: (context, event) => {
			const isDown = event.params.hoveredIndex > context.draggedIndex;
			return isDown ? context.pointery + event.params.hoveredElHeight : context.pointery - event.params.hoveredElHeight;
		},
		y: (_, event) => event.params.y - event.params.hoveredElHeight,
		draggedIndex: (_, event) => event.params.hoveredIndex
	}),
	resetWorkout: assign({
		workout: () => {
			return {
				...emptyWorkout
			};
		}
	})
};

const guards = {
	isNameEmpty: (context, _) => context.workout.name.length === 0,
	isSession: (_, event) => event.params.workoutType === 'session',
	isNew: (_, event) => event.params.isNew
};

export const editWorkoutMachine = Machine(
	{
		id: 'editWorkout',
		context: {
			workout: {
				...emptyWorkout
			},
			editedExercise: null,
			exerciseHistory: null,
			nameError: '',
			draggedIndex: null,
			draggedId: null,
			draggedElHeight: null,
			x: 0,
			y: 0,
			pointerx: 0,
			pointery: 0
		},
		initial: 'editing',
		states: {
			editing: {
				id: 'editing',
				initial: 'normal',
				states: {
					normal: {},
					error: {
						entry: ['updateNameError'],
						exit: ['clearNameError']
					}
				},
				on: {
					NEW_WORKOUT: {
						actions: ['resetWorkout']
					},
					DATE_INPUT: {
						actions: ['updateWorkoutDate']
					},
					NAME_INPUT: {
						actions: ['updateWorkoutName']
					},
					NOTES_INPUT: {
						actions: ['updateWorkoutNotes']
					},
					INSTRUCTIONS_INPUT: {
						actions: ['updateWorkoutInstructions']
					},
					USE_TEMPLATE: {
						target: 'selectingtemplate'
					},
					ADD_EXERCISE: 'exercise.adding',
					EDIT_EXERCISE: 'exercise.editing',
					DELETE_EXERCISE: {
						actions: ['deleteExercise']
					},
					ADD_EXECUTION: 'execution',
					EDIT_EXECUTION: 'execution',
					DELETE_EXECUTION: {
						actions: ['deleteExecution']
					},
					DRAG: {
						target: 'dragging'
					},
					GET_EXERCISE_HISTORY: {
						target: 'exerciseHistory'
					},
					SAVE_SESSION: [
						{
							cond: 'isNameEmpty',
							target: 'editing.error'
						},
						{
							cond: 'isNew',
							target: 'saving.new.session'
						},
						{
							target: 'saving.session'
						}
					],
					SAVE_TEMPLATE: [
						{
							cond: 'isNameEmpty',
							target: 'editing.error'
						},
						{
							cond: 'isNew',
							target: 'saving.new.template'
						},
						{
							target: 'saving.template'
						}
					],
					CANCEL: {
						target: 'canceled',
						actions: sendParent({ type: 'CANCEL' })
					},
					DISCARD: [
						{
							cond: 'isSession',
							target: 'canceled',
							actions: ['routeLog']
						},
						{
							target: 'canceled',
							actions: ['routeTemplates']
						}
					]
				}
			},
			exerciseHistory: {
				initial: 'fetching',
				states: {
					fetching: {
						invoke: {
							src: 'getExerciseHistory',
							onDone: {
								target: 'displaying',
								actions: ['updateExerciseHistory']
							},
							onError: {
								target: '#editing'
							}
						}
					},
					displaying: {}
				},
				on: {
					DISMISS: {
						target: '#editing',
						actions: ['clearExerciseHistory']
					}
				}
			},
			selectingtemplate: {
				initial: 'selecting',
				states: {
					selecting: {
						on: {
							SELECT: {
								target: 'fetching'
							},
							CANCEL: {
								target: '#editing'
							}
						}
					},
					fetching: {
						invoke: {
							src: 'getTemplate',
							onDone: {
								target: '#editing',
								actions: ['updateWorkoutWithTemplate']
							},
							onError: {
								target: '#editing'
							}
						}
					}
				}
			},
			exercise: {
				entry: ['spawnEditedExercise'],
				initial: 'adding',
				states: {
					adding: {
						on: {
							DONE: {
								target: '#editing',
								actions: ['addWorkoutExercise']
							}
						}
					},
					editing: {
						on: {
							DONE: {
								target: '#editing',
								actions: ['updateWorkoutExercise']
							}
						}
					}
				},
				on: {
					EXERCISE_INPUT: {
						actions: ['forwardToEditedExercise']
					},
					ADD_MOVEMENT: {
						actions: ['forwardToEditedExercise']
					},
					DELETE_MOVEMENT: {
						actions: ['forwardToEditedExercise']
					},
					SAVE_EXERCISE: {
						actions: ['forwardToEditedExercise']
					},
					CANCEL: 'editing'
				},
				exit: ['clearEditedExercise']
			},
			execution: {
				entry: assign({
					editedExercise: (_, event) =>
						spawn(
							editWorkoutExerciseMachine(
								event.params.exercise,
								event.params.movement,
								event.params.execution
							)
						)
				}),
				on: {
					SAVE_EXECUTION: {
						actions: send((_, event) => event, {
							to: context => context.editedExercise
						})
					},
					DONE: {
						target: 'editing',
						actions: ['updateWorkoutExercise']
					},
					CANCEL: 'editing'
				},
				exit: assign({
					editedExercise: null
				})
			},
			dragging: {
				entry: ['setDrag'],
				initial: 'outside',
				states: {
					outside: {
						on: {
							ENTER: {
								target: 'inside'
							}
						}
					},
					inside: {
						entry: ['updateExerciseOrder'],
						on: {
							LEAVE: {
								target: 'outside'
							}
						}
					}
				},
				on: {
					MOVE: {
						internal: true,
						actions: ['updateCoords']
					},
					DROP: {
						target: 'editing'
					}
				},
				exit: ['clearDragging']
			},
			saving: {
				initial: 'session',
				states: {
					session: {
						invoke: {
							src: 'saveSession',
							onDone: {
								target: '#done'
							},
							onError: {
								target: '#editing'
							}
						}
					},
					template: {
						invoke: {
							src: 'saveTemplate',
							onDone: {
								target: '#done'
							},
							onError: {
								target: '#editing'
							}
						}
					},
					new: {
						initial: 'session',
						states: {
							session: {
								invoke: {
									src: 'saveSession',
									onDone: {
										target: '#done',
										actions: ['routeLog']
									},
									onError: {
										target: '#editing'
									}
								}
							},
							template: {
								invoke: {
									src: 'saveTemplate',
									onDone: {
										target: '#done',
										actions: ['routeTemplates']
									},
									onError: {
										target: '#editing'
									}
								}
							}
						}
					}
				}
			},
			done: {
				id: 'done',
				data: {
					workoutData: (context, _) => context.workout
				},
				type: 'final'
			},
			canceled: {
				type: 'final'
			}
		}
	},
	{
		actions,
		services,
		guards
	}
);
