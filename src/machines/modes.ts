import type { Session } from 'types';
import { assign, createMachine, sendParent } from 'xstate';
import { assertEventType } from 'src/utils';

export interface ModesContext {
	history?: Partial<Session>;
	y: number;
	pointery: number;
	draggedIndex?: number;
	draggedId?: number;
}

export type ModesEvent =
	| { type: 'REORDER' }
	| { type: 'HISTORY' }
	| { type: 'DELETE' }
	| { type: 'DELETE_EXERCISE'; data: { instanceIndex: number } }
	| { type: 'EXERCISE_HISTORY'; data: { exerciseId: number; date: string; token: string } }
	| {
			type: 'done.invoke.getHistory';
			data: Partial<Session>;
	  }
	| { type: 'DISMISS' }
	| { type: 'ENABLE' }
	| { type: 'DISABLE' }
	| { type: 'DRAG'; data: { y: number; index: number; id: number } }
	| { type: 'MOVE'; data: { y: number } }
	| { type: 'SWAP'; data: { swappedIndex: number } }
	| { type: 'DROP' };

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
				history: Partial<Session>;
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
			history: undefined,
			y: 0,
			pointery: 0,
			draggedIndex: undefined,
			draggedId: undefined
		},
		states: {
			enabled: {
				initial: 'idle',
				states: {
					idle: {},
					reordering: {
						initial: 'idle',
						states: {
							idle: {
								on: {
									DRAG: {
										target: 'dragging',
										actions: ['setDragging']
									}
								}
							},
							dragging: {
								on: {
									MOVE: {
										actions: ['updateCoords']
									},
									SWAP: {
										actions: ['notifyReorder']
									},
									DROP: {
										target: 'idle',
										actions: ['clearDragging']
									}
								}
							}
						},
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
			}),
			setDragging: assign((_, event) => {
				assertEventType(event, 'DRAG');
				const { y, index, id } = event.data;
				return {
					pointery: y,
					draggedIndex: index,
					draggedId: id
				};
			}),
			clearDragging: assign((_, event) => {
				assertEventType(event, 'DROP');
				return {
					y: 0,
					pointery: 0,
					draggedIndex: undefined,
					draggedId: undefined
				};
			}),
			updateCoords: assign({
				y: (context, event) => {
					assertEventType(event, 'MOVE');
					return event.data.y - context.pointery;
				}
			}),
			notifyReorder: sendParent((context, event) => {
				assertEventType(event, 'SWAP');
				return {
					type: 'REORDER_EXERCISES',
					data: { from: context.draggedIndex, to: event.data.swappedIndex }
				};
			})
		},
		services: {
			getHistory: async (_, event) => {
				assertEventType(event, 'EXERCISE_HISTORY');
				const { token, exerciseId, date } = event.data;
				try {
					const res = await fetch('/.netlify/functions/get-exercise-history', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ exerciseId, date })
					});
					const data = await res.json();
					const instance = data.sessions[0];
					return instance;
				} catch (error) {
					console.warn(error);
					throw error;
				}
			}
		}
	}
);
