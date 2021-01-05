import { assertEventType, createExecution } from 'src/utils';
import type { ExerciseInstance } from 'types';
import { createMachine, assign } from 'xstate';

export interface ExerciseContext {
	instance: ExerciseInstance;
	userId: string;
}

export type ExerciseEvent =
	| { type: 'EXERCISE_INPUT'; data: { exercise: { name: string; id?: number } } }
	| { type: 'NEW_EXECUTION' }
	| { type: 'CANCEL' }
	| { type: 'SAVE' };

export type ExerciseState =
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
					NEW_EXECUTION: {
						actions: ['addExecution']
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
			}),
			addExecution: assign({
				instance: (context, event) => {
					assertEventType(event, 'NEW_EXECUTION');
					const currentExecutions = context.instance.executions;
					const updatedExecutions = [
						...currentExecutions,
						createExecution(currentExecutions.length + 1)
					];
					return {
						...context.instance,
						executions: updatedExecutions
					};
				}
			})
		}
	}
);
