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
};

export const editTemplateExerciseMachine = (exercise, movement, execution) => {
	return Machine(
		{
			id: 'editExercise',
			context: {
				exercise,
				movement,
				execution,
			},
			initial: 'editing',
			states: {
				editing: {
					on: {
						SAVE_EXERCISE: {
							target: 'done',
							actions: ['updateMovementExercise'],
						},
						SAVE_EXECUTION: {
							target: 'done',
							actions: ['updateMovementExecution'],
						},
					},
				},
				done: {
					entry: sendParent({ type: 'DONE', exercise }),
					type: 'final',
				},
			},
		},
		{
			actions,
		}
	);
};
