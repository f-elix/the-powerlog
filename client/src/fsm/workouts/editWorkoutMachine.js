import { Machine, assign, spawn, send } from 'xstate';
import { editWorkoutExerciseMachine } from './editWorkoutExerciseMachine';
import { getData, getToken } from '@/assets/js/utils.js';

const reorder = (array, from, to) => {
	const reorderedArray = array;
	reorderedArray.splice(to, 0, reorderedArray.splice(from, 1)[0]);
	return reorderedArray;
};

const services = {
	saveTemplate: async (context, _) => {
		const queryName = 'saveTemplate';
		const query = {
			query: `
				mutation saveTemplate($data: TemplateInput!) {
					saveTemplate(templateData: $data) {
						name
					}
				}
			`,
			variables: {
				data: context.template
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
		const queryName = 'saveSession';
		const query = {
			query: `
				mutation saveSession($data: SessionInput!) {
					saveSession(sessionData: $data) {
						name
					}
				}
			`,
			variables: {
				data: context.workout
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
	updateWorkoutName: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			updatedWorkout.name = event.params.value;
			return updatedWorkout;
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
	updateDraggedExercise: assign({
		draggedExercise: (_, event) => event.params.exercise
	}),
	clearDraggedExercise: assign({
		draggedExercise: null
	}),
	updatePointer: assign({
		pointerx: (_, event) => event.params.x,
		pointery: (_, event) => event.params.y
	}),
	updateCoords: assign({
		x: (context, event) => event.params.x - context.pointerx,
		y: (context, event) => event.params.y - context.pointery
	}),
	updatePointerPosition: assign({
		pointery: (context, event) => {
			if (context.y < 0) {
				return context.pointery - event.params.elHeight;
			} else {
				return context.pointery + event.params.elHeight;
			}
		}
	}),
	clearDragging: assign({
		x: 0,
		y: 0,
		pointerx: 0,
		pointery: 0
	}),
	updateExerciseOrder: assign({
		workout: (context, event) => {
			const updatedWorkout = context.workout;
			const draggedExerciseIndex = context.workout.exercises.findIndex(
				e => e._id === context.draggedExercise._id
			);
			const hoveredExerciseIndex = context.workout.exercises.findIndex(e => e._id === event.params.exerciseId);
			updatedWorkout.exercises = reorder(context.workout.exercises, draggedExerciseIndex, hoveredExerciseIndex);
			return updatedWorkout;
		}
	})
};

const guards = {
	isNameEmpty: (context, _) => context.workout.name.length === 0
};

export const editWorkoutMachine = Machine(
	{
		id: 'editWorkout',
		context: {
			workout: {
				name: '',
				exercises: []
			},
			editedExercise: null,
			nameError: '',
			draggedExercise: null,
			hoveredExercise: null,
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
					NAME_INPUT: {
						actions: ['updateWorkoutName']
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
					SAVE_SESSION: [
						{
							cond: 'isNameEmpty',
							target: 'editing.error'
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
							target: 'saving.template'
						}
					],
					CANCEL_EDIT: {
						target: 'canceled'
					}
				}
			},
			exercise: {
				initial: 'adding',
				states: {
					adding: {
						entry: assign({
							editedExercise: (_, event) => spawn(editWorkoutExerciseMachine())
						}),
						on: {
							DONE: {
								target: '#editing',
								actions: ['addWorkoutExercise']
							}
						}
					},
					editing: {
						entry: assign({
							editedExercise: (_, event) => spawn(editWorkoutExerciseMachine(event.params.exercise))
						}),
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
				exit: assign({
					editedExercise: null
				})
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
				entry: ['updatePointer', 'updateDraggedExercise'],
				initial: 'outside',
				states: {
					outside: {
						on: {
							ENTER: {
								actions: ['updateExerciseOrder', 'updatePointerPosition'],
								target: 'inside'
							}
						}
					},
					inside: {
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
				exit: ['clearDragging', 'clearDraggedExercise']
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
					}
				}
			},
			done: {
				id: 'done',
				type: 'final',
				data: {
					workoutData: (context, _) => context.workout
				}
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
