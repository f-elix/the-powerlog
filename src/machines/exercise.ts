import {
	assertEventType,
	createExecution,
	createExerciseInstance,
	updateObjectKey,
	generateId
} from 'src/utils';
import type { ExerciseInstance } from 'types';
import { createMachine, assign, sendParent } from 'xstate';
import { update } from 'xstate/lib/actionTypes';

export interface ExerciseContext {
	instances: ExerciseInstance[];
	userId: string;
	sessionId?: number;
	supersetId?: number;
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
			instances: [],
			userId: '',
			sessionId: undefined,
			supersetId: undefined,
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
						actions: ['removeInstance']
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
				data: (context) => ({ instances: context.instances })
			}
		}
	},
	{
		actions: {
			updateExercise: assign({
				instances: (context, event) => {
					assertEventType(event, 'EXERCISE_INPUT');
					const { instanceId, exercise } = event.data;
					const { instances } = context;
					const instanceIndex = instances.findIndex((inst) => inst.id === instanceId);
					const instance = instances[instanceIndex];
					if (!instance) {
						return instances;
					}
					const updatedInstance = {
						...instance,
						exercise: {
							...exercise,
							userId: context.userId
						}
					};
					instances[instanceIndex] = updatedInstance;
					return instances;
				}
			}),
			addExecution: assign({
				instances: (context, event) => {
					assertEventType(event, 'NEW_EXECUTION');
					const { instanceId } = event.data;
					const { instances } = context;
					const instanceIndex = instances.findIndex((inst) => inst.id === instanceId);
					const instance = instances[instanceIndex];
					if (!instance) {
						return instances;
					}
					const updatedExecutions = [
						...instance.executions,
						createExecution(generateId())
					];
					const updatedInstance = {
						...instance,
						executions: updatedExecutions
					};
					instances[instanceIndex] = updatedInstance;
					return instances;
				}
			}),
			updateExecution: assign({
				instances: (context, event) => {
					assertEventType(event, 'EXECUTION_INPUT');
					const { instanceId, executionId, path, value } = event.data;
					const { instances } = context;
					const instanceIndex = instances.findIndex((inst) => inst.id === instanceId);
					const instance = instances[instanceIndex];
					if (!instance) {
						return instances;
					}
					const { executions } = instance;
					const executionIndex = executions.findIndex((ex) => ex.id === executionId);
					const execution = executions[executionIndex];
					executions[executionIndex] = updateObjectKey(execution, path, value);
					const updatedInstance = {
						...instance,
						executions
					};
					instances[instanceIndex] = updatedInstance;
					return instances;
				}
			}),
			deleteExecution: assign({
				instances: (context, event) => {
					assertEventType(event, 'DELETE_EXECUTION');
					const { instances } = context;
					const { instanceId, executionId } = event.data;
					const instanceIndex = instances.findIndex((inst) => inst.id === instanceId);
					const instance = instances[instanceIndex];
					if (!instance) {
						return instances;
					}
					const executions = instance.executions.filter(
						(exec) => exec.id !== executionId
					);
					const updatedInstance = {
						...instance,
						executions
					};
					instances[instanceIndex] = updatedInstance;
					return instances;
				}
			}),
			addNewInstance: assign({
				instances: (context, event) => {
					assertEventType(event, 'NEW_INSTANCE');
					const { instances, sessionId, supersetId } = context;
					if (!sessionId) {
						return instances;
					}
					const newInstance = createExerciseInstance(sessionId);
					const updatedInstances = [...instances, newInstance].map((instance) => ({
						...instance,
						supersetId
					}));
					return updatedInstances;
				}
			}),
			removeInstance: assign({
				instances: (context, event) => {
					assertEventType(event, 'DELETE_INSTANCE');
					const updatedInstances = context.instances.filter(
						(instance) => instance.id !== event.data.instanceId
					);
					if (updatedInstances.length === 1) {
						updatedInstances[0].supersetId = undefined;
					}
					return updatedInstances;
				}
			}),
			notifyCancel: sendParent('CANCEL_EXERCISE')
		},
		guards: {
			hasExercise: (context) => !!context.instances.every((inst) => !!inst.exercise?.name)
		}
	}
);
