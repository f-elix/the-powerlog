import { Machine, assign, sendParent } from 'xstate';
import ObjectID from 'bson-objectid';

const actions = {
	updateMovementExecution: assign({
		workoutExercise: (context, event) => {
			const { executionData } = event.params;
			const execution = {
				sets: executionData.sets,
				reps: executionData.reps,
				time: {
					amount: executionData.time,
					unit: executionData.selectedTimeUnit
				},
				load: {
					amount: executionData.load,
					unit: executionData.selectedLoadUnit
				}
			};
			const movementIndex = context.workoutExercise.movements.findIndex(m => m._id === context.movement._id);
			const updatedExercise = context.workoutExercise;
			if (executionData._id) {
				execution._id = executionData._id;
				const executionIndex = context.movement.executions.findIndex(e => e._id === context.execution._id);
				updatedExercise.movements[movementIndex].executions[executionIndex] = execution;
			} else {
				execution._id = ObjectID();
				updatedExercise.movements[movementIndex].executions = [
					...updatedExercise.movements[movementIndex].executions,
					execution
				];
			}
			return updatedExercise;
		}
	}),
	updateExerciseMovement: assign({
		workoutExercise: (context, event) => {
			const { movementId, exercise } = event.params;
			const movementIndex = context.workoutExercise.movements.findIndex(m => m._id === movementId);
			const updatedWorkoutExercise = context.workoutExercise;
			updatedWorkoutExercise.movements[movementIndex].exercise = exercise;
			return updatedWorkoutExercise;
		}
	}),
	addMovement: assign({
		workoutExercise: (context, _) => {
			const updatedExercise = context.workoutExercise;
			const addedMovement = {
				_id: ObjectID(),
				exercise: {
					name: ''
				},
				executions: []
			};
			updatedExercise.movements.push(addedMovement);
			return updatedExercise;
		}
	}),
	deleteMovement: assign({
		workoutExercise: (context, event) => {
			const updatedExercise = context.workoutExercise;
			updatedExercise.movements = updatedExercise.movements.filter(m => m._id !== event.params.movementId);
			return updatedExercise;
		}
	}),
	generateExerciseIds: assign({
		workoutExercise: (context, _) => {
			const updatedExercise = context.workoutExercise;
			updatedExercise.movements.forEach(m => {
				if (!m.exercise._id) {
					m.exercise._id = ObjectID();
				}
			});
			return updatedExercise;
		}
	}),
	updateExerciseError: assign({
		exerciseError: 'Movement name is required.'
	}),
	updateExecutionError: assign({
		executionError: 'Number of sets is required.'
	}),
	clearErrors: assign({
		exerciseError: '',
		executionError: ''
	})
};

const guards = {
	hasEmptyMovement: (context, _) => context.workoutExercise.movements.some(m => m.exercise.name.trim().length === 0),
	isSetsEmpty: (_, event) => event.params.executionData.sets <= 0
};

export const editWorkoutExerciseMachine = (workoutExercise, movement, execution) => {
	if (!workoutExercise) {
		workoutExercise = {
			_id: ObjectID(),
			movements: [
				{
					_id: ObjectID(),
					exercise: {
						name: ''
					},
					executions: []
				}
			]
		};
	}
	return Machine(
		{
			id: 'editWorkoutExercise',
			context: {
				workoutExercise,
				movement,
				execution,
				exerciseError: '',
				executionError: ''
			},
			initial: 'editing',
			states: {
				editing: {
					initial: 'normal',
					states: {
						normal: {},
						error: {
							exit: ['clearErrors']
						}
					},
					on: {
						EXERCISE_INPUT: {
							actions: ['updateExerciseMovement']
						},
						ADD_MOVEMENT: {
							actions: ['addMovement']
						},
						DELETE_MOVEMENT: {
							actions: ['deleteMovement']
						},
						SAVE_EXERCISE: [
							{
								cond: 'hasEmptyMovement',
								target: 'editing.error',
								actions: ['updateExerciseError']
							},
							{
								target: 'done',
								actions: ['generateExerciseIds']
							}
						],
						SAVE_EXECUTION: [
							{
								cond: 'isSetsEmpty',
								target: 'editing.error',
								actions: ['updateExecutionError']
							},
							{
								target: 'done',
								actions: ['updateMovementExecution']
							}
						]
					}
				},
				done: {
					entry: sendParent(context => ({
						type: 'DONE',
						exercise: context.workoutExercise
					})),
					type: 'final'
				}
			}
		},
		{
			actions,
			guards
		}
	);
};
