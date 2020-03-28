import { Machine, assign, sendParent } from 'xstate';
import ObjectID from 'bson-objectid';

const actions = {
	updateExercise: assign({
		exercise: (context, event) => {
			const { value } = event.params;
			const newExecution = {
				_id: ObjectID(),
				sets: value.sets,
				reps: value.reps,
				time: {
					amount: value.time,
					unit: value.selectedTimeUnit
				},
				load: {
					amount: value.load,
					unit: value.selectedLoadUnit
				}
			};
			const movementIndex = context.exercise.movements.findIndex(m => m === context.movement);
			const updatedExercise = context.exercise;
			updatedExercise.movements[movementIndex].executions = [
				...updatedExercise.movements[movementIndex].executions,
				newExecution
			];
			return updatedExercise;
		}
	})
};

export const editExerciseMachine = (exercise, movement) => {
	return Machine(
		{
			id: 'editExercise',
			context: {
				exercise,
				movement
			},
			initial: 'editing',
			states: {
				editing: {
					on: {
						SAVE: {
							target: 'saved',
							actions: ['updateExercise']
						}
					}
				},
				saved: {
					entry: sendParent({ type: 'DONE', exercise }),
					type: 'final'
				}
			}
		},
		{
			actions
		}
	);
};
