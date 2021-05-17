import { assertEventType, getToken } from 'src/utils';
import type { Exercise } from 'types';
import { createMachine, assign } from 'xstate';
import { router } from 'src/router';
import { startProgress, endProgress } from 'src/lib/nprogress';

interface ExerciseDetailContext {
	exercise?: Exercise;
	error?: string;
}

type ExerciseDetailEvent =
	| { type: 'GET_EXERCISE'; data: { exerciseId: number } }
	| {
			type: 'done.invoke.getExerciseDetail';
			data: { exercises_by_pk: Exercise };
	  }
	| { type: 'error.platform.getExerciseDetail'; data: string }
	| { type: 'EDIT_EXERCISE_NAME' }
	| { type: 'CANCEL' }
	| { type: 'SAVE'; data: { exerciseName: string } }
	| { type: 'done.invoke.updateExercise'; data: { update_exercises_by_pk: { name: string } } }
	| { type: 'error.platform.updateExercise'; data: string };

type ExerciseDetailState =
	| {
			value: 'idle.normal';
			context: ExerciseDetailContext;
	  }
	| {
			value: 'idle.error';
			context: ExerciseDetailContext;
	  }
	| {
			value: 'fetching';
			context: ExerciseDetailContext;
	  }
	| { value: 'loaded'; context: ExerciseDetailContext }
	| { value: 'editing'; context: ExerciseDetailContext }
	| { value: 'updatingExercise'; context: ExerciseDetailContext };

export const exerciseDetailMachine = createMachine<
	ExerciseDetailContext,
	ExerciseDetailEvent,
	ExerciseDetailState
>(
	{
		id: 'exerciseDetail',
		context: {
			exercise: undefined,
			error: undefined
		},
		initial: 'idle',
		states: {
			idle: {
				initial: 'normal',
				states: {
					normal: {},
					error: {}
				},
				on: {
					GET_EXERCISE: 'fetching'
				}
			},
			fetching: {
				entry: ['startProgress'],
				exit: ['endProgress'],
				invoke: {
					id: 'getExerciseDetail',
					src: 'getExerciseDetail',
					onDone: {
						target: 'loaded',
						actions: ['updateExercise']
					},
					onError: {
						target: 'idle.error',
						actions: ['updateError']
					}
				}
			},
			loaded: {
				on: {
					EDIT_EXERCISE_NAME: {
						target: 'editing'
					}
				}
			},
			editing: {
				on: {
					CANCEL: 'loaded',
					SAVE: 'updatingExercise'
				}
			},
			updatingExercise: {
				invoke: {
					id: 'updateExercise',
					src: 'updateExercise',
					onDone: {
						target: 'loaded',
						actions: ['updateExerciseName']
					},
					onError: {
						target: 'loaded',
						actions: ['updateError']
					}
				}
			}
		}
	},
	{
		actions: {
			updateExercise: assign({
				exercise: (_, event) => {
					assertEventType(event, 'done.invoke.getExerciseDetail');
					return event.data.exercises_by_pk;
				}
			}),
			updateExerciseName: assign({
				exercise: (context, event) => {
					assertEventType(event, 'done.invoke.updateExercise');
					const { exercise } = context;
					if (!exercise) {
						return undefined;
					}
					const { name } = event.data.update_exercises_by_pk;
					router.send({
						type: 'UPDATE_EXERCISE_NAME',
						data: { exerciseName: name, exerciseId: exercise.id }
					});
					return {
						...exercise,
						name
					};
				}
			}),
			updateError: assign({
				error: (_, event) => {
					if (
						event.type !== 'error.platform.getExerciseDetail' &&
						event.type !== 'error.platform.updateExercise'
					) {
						return undefined;
					}
					return event.data;
				}
			}),
			startProgress,
			endProgress
		},
		services: {
			getExerciseDetail: async (_, event) => {
				assertEventType(event, 'GET_EXERCISE');
				try {
					const token = await getToken();
					const { exerciseId } = event.data;
					const res = await fetch('/.netlify/functions/get-exercise-detail', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ exerciseId })
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw error;
				}
			},
			updateExercise: async (context, event) => {
				assertEventType(event, 'SAVE');
				try {
					const token = await getToken();
					const { exerciseName } = event.data;
					const exerciseId = context.exercise?.id;
					const res = await fetch('/.netlify/functions/update-exercise', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ exerciseName, exerciseId })
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw error;
				}
			}
		}
	}
);
