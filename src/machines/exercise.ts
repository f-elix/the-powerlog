import { assertEventType } from 'src/utils';
import type { ExerciseInstance } from 'types';
import { createMachine, assign } from 'xstate';

interface ExerciseContext {
	instance: ExerciseInstance;
	userId: string;
}

type ExerciseEvent =
	| { type: 'CANCEL' }
	| { type: 'SAVE' }
	| { type: 'EXERCISE_INPUT'; data: { exercise: { name: string; id?: number } } };

type ExerciseState =
	| {
			value: 'editing';
			context: ExerciseContext;
	  }
	| {
			value: 'cancelled';
			context: ExerciseContext;
	  }
	| {
			value: 'done';
			context: ExerciseContext;
	  };

export const exerciseMachine = createMachine<ExerciseContext, ExerciseEvent, ExerciseState>(
	{
		id: 'exercise',
		initial: 'editing',
		states: {
			editing: {
				on: {
					EXERCISE_INPUT: {
						actions: ['updateExercise']
					},
					CANCEL: {
						target: 'cancelled'
					},
					SAVE: {
						target: 'done'
					}
				}
			},
			cancelled: {
				type: 'final'
			},
			done: {
				type: 'final',
				data: (context) => ({ exercise: context })
			}
		}
	},
	{
		actions: {
			updateExercise: assign({
				instance: (context, event) => {
					assertEventType(event, 'EXERCISE_INPUT');
					return {
						...context.instance,
						exercise: {
							...event.data.exercise,
							userId: context.userId
						}
					};
				}
			})
		}
	}
);
