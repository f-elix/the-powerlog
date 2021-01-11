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
	| {
			type: 'done.invoke.getHistory';
			data: ExerciseInstance;
	  }
	| { type: 'DISMISS' }
	| { type: 'ENABLE' }
	| { type: 'DISABLE' };

export type ModesState =
	| {
			value: 'enabled.idle';
			context: ModesContext;
	  }
	| {
			value: 'enabled.reordering';
			context: ModesContext;
	  }
	| {
			value: 'enabled.history.idle';
			context: ModesContext & {
				history: undefined;
			};
	  }
	| {
			value: 'enabled.history.fetching';
			context: ModesContext & {
				history: undefined;
			};
	  }
	| {
			value: 'enabled.history.loaded';
			context: ModesContext & {
				history: ExerciseInstance;
			};
	  }
	| {
			value: 'enabled.deleting';
			context: ModesContext;
	  }
	| {
			value: 'enabled.last';
			context: ModesContext;
	  }
	| {
			value: 'disabled';
			context: ModesContext;
	  };

export const modesMachine = createMachine<ModesContext, ModesEvent, ModesState>(
	{
		id: 'modes',
		initial: 'enabled',
		context: {
			history: undefined
		},
		states: {
			enabled: {
				initial: 'idle',
				states: {
					idle: {},
					reordering: {
						on: {
							REORDER: 'idle'
						}
					},
					history: {
						initial: 'ready',
						states: {
							ready: {
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
										target: 'ready'
									}
								}
							}
						},
						on: {
							HISTORY: 'idle'
						}
					},
					deleting: {
						on: {
							DELETE: 'idle',
							DELETE_EXERCISE: {
								actions: ['notifyDeleteExercise']
							}
						}
					},
					last: {
						type: 'history'
					}
				},
				on: {
					REORDER: '.reordering',
					HISTORY: '.history',
					DELETE: '.deleting',
					DISABLE: '#modes.disabled'
				}
			},
			disabled: {
				on: {
					ENABLE: 'enabled.last'
				}
			}
		}
	},
	{
		actions: {
			notifyDeleteExercise: sendParent((_, event) => event),
			updateHistory: assign({
				history: (_, event) => {
					assertEventType(event, 'done.invoke.getHistory');
					return event.data;
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
					const instance = data.exercises_by_pk.exercise_instances[0];
					return instance;
				} catch (error) {
					console.warn(error);
					throw error;
				}
			}
		}
	}
);
