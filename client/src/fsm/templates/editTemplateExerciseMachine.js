import { Machine, assign, sendParent } from 'xstate';
import ObjectID from 'bson-objectid';

const actions = {
	updateMovementExecution: assign({
		templateExercise: (context, event) => {
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
			const movementIndex = context.exercise.movements.findIndex(m => m._id === context.movement._id);
			const updatedExercise = context.exercise;
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
		templateExercise: (context, event) => {
			const { movementId, exercise } = event.params;
			const movementIndex = context.templateExercise.movements.findIndex(m => m._id === movementId);
			const updatedTemplateExercise = context.templateExercise;
			updatedTemplateExercise.movements[movementIndex].exercise = exercise;
			return updatedTemplateExercise;
		}
	}),
	addMovement: assign({
		templateExercise: (context, _) => {
			const updatedExercise = context.templateExercise;
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
		templateExercise: (context, event) => {
			const updatedExercise = context.templateExercise;
			updatedExercise.movements = updatedExercise.movements.filter(m => m._id !== event.params.movementId);
			return updatedExercise;
		}
	}),
	generateExerciseIds: assign({
		templateExercise: (context, _) => {
			const updatedExercise = context.exercise;
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
	hasEmptyMovement: (context, _) => context.templateExercise.movements.some(m => m.exercise.name.trim().length === 0),
	isSetsEmpty: (_, event) => event.params.executionData.sets <= 0
};

export const editTemplateExerciseMachine = (templateExercise, movement, execution) => {
	if (!templateExercise) {
		templateExercise = {
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
			id: 'editTemplateExercise',
			context: {
				templateExercise,
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
						exercise: context.templateExercise
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
