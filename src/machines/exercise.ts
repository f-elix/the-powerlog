import { assertEventType, createExecution, updateObjectKey } from 'src/utils';
import type { ExerciseInstance } from 'types';
import { createMachine, assign, sendParent } from 'xstate';

export interface ExerciseContext {
	instance: ExerciseInstance;
	userId: string;
	exerciseError?: string;
}

export type ExerciseEvent =
	| { type: 'EXERCISE_INPUT'; data: { exercise: { name: string; id?: number } } }
	| { type: 'EXECUTION_INPUT'; data: { path: string; value: any; executionId: number } }
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
			value: 'error';
			context: ExerciseContext;
			exerciseError: string;
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
					EXECUTION_INPUT: {
						actions: ['updateExecution']
					},
					CANCEL: {
						target: 'cancelled'
					},
					SAVE: [
						{
							cond: 'hasExercise',
							target: 'done'
						},
						{
							target: 'error'
						}
					]
				}
			},
			cancelled: {
				entry: ['notifyCancel'],
				type: 'final'
			},
			done: {
				type: 'final',
				data: (context) => ({ exercise: context.instance })
			},
			error: {
				on: {
					CANCEL: {
						target: 'cancelled'
					},
					'*': {
						target: 'editing'
					}
				}
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
			}),
			updateExecution: assign({
				instance: (context, event) => {
					assertEventType(event, 'EXECUTION_INPUT');
					const { executions } = context.instance;
					const executionIndex = context.instance.executions.findIndex(
						(ex) => ex.id === event.data.executionId
					);
					const execution = context.instance.executions[executionIndex];
					executions[executionIndex] = updateObjectKey(
						execution,
						event.data.path,
						event.data.value
					);
					return {
						...context.instance,
						executions
					};
				}
			}),
			notifyCancel: sendParent('CANCEL_EXERCISE')
		},
		guards: {
			hasExercise: (context) => !!context.instance.exercise
		}
	}
);
