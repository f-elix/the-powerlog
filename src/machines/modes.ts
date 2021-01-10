import type { ExerciseInstance } from 'types';
import { assign, createMachine, sendParent } from 'xstate';
import { assertEventType } from 'src/utils';

export interface ModesContext {
	history?: ExerciseInstance;
}

export type ModesEvent =
	| { type: 'REORDER' }
	| { type: 'HISTORY' }
	| { type: 'DELETE' }
	| { type: 'DELETE_EXERCISE'; data: { instanceIndex: number } }
	| { type: 'EXERCISE_HISTORY'; data: { exerciseId: number; token: string } }
	| { type: 'done.invoke.getHistory'; data: { exercises_by_pk: ExerciseInstance } }
	| { type: 'DISMISS' };

export type ModesState =
	| {
			value: 'idle';
			context: ModesContext;
	  }
	| {
			value: 'reordering';
			context: ModesContext;
	  }
	| {
			value: 'history.idle';
			context: ModesContext & {
				history: undefined;
			};
	  }
	| {
			value: 'history.fetching';
			context: ModesContext & {
				history: undefined;
			};
	  }
	| {
			value: 'history.loaded';
			context: ModesContext & {
				history: ExerciseInstance;
			};
	  }
	| {
			value: 'deleting';
			context: ModesContext;
	  };

export const modesMachine = createMachine<ModesContext, ModesEvent, ModesState>(
	{
		id: 'modes',
		initial: 'idle',
		context: {
			history: undefined
		},
		states: {
			idle: {},
			reordering: {
				on: {
					REORDER: 'idle'
				}
			},
			history: {
				initial: 'idle',
				states: {
					idle: {
						on: {
							EXERCISE_HISTORY: 'fetching'
						}
					},
					fetching: {
						invoke: {
							id: 'getHistory',
							src: 'getHistory',
							onDone: {
								target: 'loaded',
								actions: ['updateHistory']
							},
							onError: {
								target: 'loaded'
							}
						}
					},
					loaded: {
						on: {
							DISMISS: {
								target: 'idle'
							}
						}
					}
				},
				on: {
					HISTORY: '#modes.idle'
				}
			},
			deleting: {
				on: {
					DELETE: 'idle',
					DELETE_EXERCISE: {
						actions: ['notifyDeleteExercise']
					}
				}
			}
		},
		on: {
			REORDER: 'reordering',
			HISTORY: 'history',
			DELETE: 'deleting'
		}
	},
	{
		actions: {
			notifyDeleteExercise: sendParent((_, event) => event),
			updateHistory: assign({
				history: (_, event) => {
					assertEventType(event, 'done.invoke.getHistory');
					return event.data.exercises_by_pk;
				}
			})
		},
		services: {
			getHistory: async (context, event) => {
				assertEventType(event, 'EXERCISE_HISTORY');
				const { token, exerciseId } = event.data;
				if (context.history?.exerciseId === exerciseId) {
					return context.history;
				}
				try {
					const res = await fetch('/.netlify/functions/get-exercise-history', {
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
			}
		}
	}
);
