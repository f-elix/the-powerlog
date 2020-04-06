import { Machine, assign, sendParent } from 'xstate';
import ObjectID from 'bson-objectid';

const actions = {
	updateMovementExecution: assign({
		exercise: (context, event) => {
			const { executionData } = event.params;
			const execution = {
				sets: executionData.sets,
				reps: executionData.reps,
				time: {
					amount: executionData.time,
					unit: executionData.selectedTimeUnit,
				},
				load: {
					amount: executionData.load,
					unit: executionData.selectedLoadUnit,
				},
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
					execution,
				];
			}
			return updatedExercise;
		},
	}),
	updateMovementExercise: assign({
		exercise: (context, event) => {
			const { exercise } = event.params;
			const movementIndex = context.exercise.movements.findIndex(m => m === context.movement);
			const updatedExercise = context.exercise;
			updatedExercise.movements[movementIndex].exercise = exercise;
			return updatedExercise;
		},
	}),
	createExercise: assign({
		exercise: (_, event) => {
			const { exercise } = event.params;
			if (!exercise._id) {
				exercise._id = ObjectID();
			}
			const newExercise = {
				_id: ObjectID(),
				movements: [
					{
						exercise,
						executions: [],
					},
				],
			};
			return newExercise;
		},
	}),
	updateExerciseError: assign({
		exerciseError: 'Exercise name is required.',
	}),
	clearExerciseError: assign({
		exerciseError: '',
	}),
};

const guards = {
	isExerciseNameEmpty: (_, event) => event.params.exercise === null || event.params.exercise.name.trim().length === 0,
	isEditingExercise: (context, _) => !!context.exercise,
};

export const editTemplateExerciseMachine = (exercise, movement, execution) => {
	return Machine(
		{
			id: 'editTemplateExercise',
			context: {
				exercise,
				movement,
				execution,
				exerciseError: '',
			},
			initial: 'editing',
			states: {
				editing: {
					initial: 'normal',
					states: {
						normal: {},
						error: {
							exit: ['clearExerciseError'],
						},
					},
					on: {
						SAVE_EXERCISE: [
							{
								cond: 'isExerciseNameEmpty',
								target: 'editing.error',
								actions: ['updateExerciseError'],
							},
							{
								cond: 'isEditingExercise',
								target: 'done',
								actions: ['updateMovementExercise'],
							},
							{
								target: 'done',
								actions: ['createExercise'],
							},
						],
						SAVE_EXECUTION: {
							target: 'done',
							actions: ['updateMovementExecution'],
						},
					},
				},
				done: {
					entry: sendParent(context => ({ type: 'DONE', exercise: context.exercise })),
					type: 'final',
				},
			},
		},
		{
			actions,
			guards,
		}
	);
};
