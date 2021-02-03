import {
	assertEventType,
	createExecution,
	createExerciseInstance,
	updateObjectKey
} from 'src/utils';
import type { Performance } from 'types';
import { createMachine, assign, sendParent } from 'xstate';

export interface ExerciseContext {
	performance?: Performance;
	userId: string;
	exerciseError?: string;
}

export type ExerciseEvent =
	| {
			type: 'EXERCISE_INPUT';
			data: { exercise: { name: string; id?: number }; instanceId: number };
	  }
	| {
			type: 'EXECUTION_INPUT';
			data: { path: string; value: any; instanceId: number; executionId: number };
	  }
	| { type: 'DELETE_EXECUTION'; data: { instanceId: number; executionId: number } }
	| { type: 'NEW_EXECUTION'; data: { instanceId: number } }
	| { type: 'NEW_INSTANCE' }
	| { type: 'DELETE_INSTANCE'; data: { instanceId: number } }
	| { type: 'CANCEL' }
	| { type: 'SAVE' };

export type ExerciseState =
	| {
			value: 'editing.valid';
			context: ExerciseContext;
	  }
	| {
			value: 'editing.invalid';
			context: ExerciseContext;
			exerciseError: string;
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
		context: {
			userId: '',
			exerciseError: undefined
		},
		states: {
			editing: {
				initial: 'valid',
				states: {
					valid: {},
					invalid: {}
				},
				on: {
					EXERCISE_INPUT: {
						actions: ['updateExercise'],
						target: '.valid'
					},
					NEW_EXECUTION: {
						actions: ['addExecution']
					},
					EXECUTION_INPUT: {
						actions: ['updateExecution']
					},
					DELETE_EXECUTION: {
						actions: ['deleteExecution']
					},
					NEW_INSTANCE: {
						actions: ['addNewInstance']
					},
					DELETE_INSTANCE: {
						actions: ['deleteInstance']
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
							target: '.invalid'
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
				data: (context) => ({ performance: context.performance })
			}
		}
	},
	{
		actions: {
			updateExercise: assign({
				performance: (context, event) => {
					assertEventType(event, 'EXERCISE_INPUT');
					const { instanceId, exercise } = event.data;
					const { performance } = context;
					if (!performance) {
						return undefined;
					}
					const { exerciseInstances } = performance;
					const instanceIndex = exerciseInstances.findIndex(
						(inst) => inst.id === instanceId
					);
					const instance = exerciseInstances[instanceIndex];
					if (!instance) {
						return performance;
					}
					const updatedInstance = {
						...instance,
						exercise: {
							...exercise,
							userId: context.userId
						}
					};
					exerciseInstances[instanceIndex] = updatedInstance;
					return {
						...performance,
						exerciseInstances
					};
				}
			}),
			addNewInstance: assign({
				performance: (context, event) => {
					assertEventType(event, 'NEW_INSTANCE');
					const { performance } = context;
					if (!performance) {
						return undefined;
					}
					const { exerciseInstances, sessionId } = performance;
					const newInstance = createExerciseInstance(sessionId);
					const updatedInstances = [...exerciseInstances, newInstance].map(
						(instance) => ({
							...instance
						})
					);
					return {
						...performance,
						exerciseInstances: updatedInstances
					};
				}
			}),
			deleteInstance: assign({
				performance: (context, event) => {
					assertEventType(event, 'DELETE_INSTANCE');
					const { performance } = context;
					if (!performance) {
						return undefined;
					}
					const updatedInstances = performance.exerciseInstances.filter(
						(instance) => instance.id !== event.data.instanceId
					);
					return {
						...performance,
						exerciseInstances: updatedInstances
					};
				}
			}),
			addExecution: assign({
				performance: (context, event) => {
					assertEventType(event, 'NEW_EXECUTION');
					const { performance } = context;
					if (!performance) {
						return undefined;
					}
					const { instanceId } = event.data;
					const { exerciseInstances } = performance;
					const instanceIndex = exerciseInstances.findIndex(
						(inst) => inst.id === instanceId
					);
					const instance = exerciseInstances[instanceIndex];
					const updatedExecutions = [...instance.executions, createExecution()];
					const updatedInstance = {
						...instance,
						executions: updatedExecutions
					};
					exerciseInstances[instanceIndex] = updatedInstance;
					return {
						...performance,
						exerciseInstances
					};
				}
			}),
			updateExecution: assign({
				performance: (context, event) => {
					assertEventType(event, 'EXECUTION_INPUT');
					const { performance } = context;
					if (!performance) {
						return undefined;
					}
					const { instanceId, executionId, path, value } = event.data;
					const { exerciseInstances } = performance;
					const instanceIndex = exerciseInstances.findIndex(
						(inst) => inst.id === instanceId
					);
					const instance = exerciseInstances[instanceIndex];
					const { executions } = instance;
					const executionIndex = executions.findIndex((ex) => ex.id === executionId);
					const execution = executions[executionIndex];
					executions[executionIndex] = updateObjectKey(execution, path, value);
					const updatedInstance = {
						...instance,
						executions
					};
					exerciseInstances[instanceIndex] = updatedInstance;
					return {
						...performance,
						exerciseInstances
					};
				}
			}),
			deleteExecution: assign({
				performance: (context, event) => {
					assertEventType(event, 'DELETE_EXECUTION');
					const { performance } = context;
					if (!performance) {
						return undefined;
					}
					const { exerciseInstances } = performance;
					const { instanceId, executionId } = event.data;
					const instanceIndex = exerciseInstances.findIndex(
						(inst) => inst.id === instanceId
					);
					const instance = exerciseInstances[instanceIndex];
					const executions = instance.executions.filter(
						(exec) => exec.id !== executionId
					);
					const updatedInstance = {
						...instance,
						executions
					};
					exerciseInstances[instanceIndex] = updatedInstance;
					return {
						...performance,
						exerciseInstances
					};
				}
			}),

			notifyCancel: sendParent('CANCEL_PERFORMANCE')
		},
		guards: {
			hasExercise: (context) =>
				!!context.performance?.exerciseInstances.every((inst) => !!inst.exercise?.name)
		}
	}
);
