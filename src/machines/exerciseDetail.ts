import { assertEventType, getToken } from 'src/utils';
import type { Exercise } from 'types';
import { createMachine, assign } from 'xstate';

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
	| { type: 'error.platform.getExerciseDetail'; data: string };

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
	| { value: 'loaded'; context: ExerciseDetailContext };

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
			loaded: {}
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
			updateError: assign({
				error: (_, event) => {
					assertEventType(event, 'error.platform.getExerciseDetail');
					return event.data;
				}
			})
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
					console.log(data);
					return data;
				} catch (error) {
					console.warn(error);
					throw error;
				}
			}
		}
	}
);
