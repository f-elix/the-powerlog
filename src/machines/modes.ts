import type { Session } from 'types';
import { assign, createMachine, sendParent } from 'xstate';
import { assertEventType, getElMidPoint } from 'src/utils';

export interface ModesContext {
	history?: Partial<Session>;
	y: number;
	pointery: number;
	draggedIndex?: number;
	draggedId?: number;
	exerciseEls?: HTMLElement[];
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
	| { type: 'DRAG'; data: { y: number; index: number; id: number; exerciseEls: HTMLElement[] } }
	| { type: 'MOVE'; data: { y: number } }
	| { type: 'SWAP'; data: { swappedIndex: number } }
	| { type: 'EXERCISES_REORDERED'; data: { to: number } }
	| { type: 'DROP' };

export type ModesState =
	| {
			value: 'enabled.idle';
			context: ModesContext;
	  }
	| {
			value: 'enabled.reordering.idle';
			context: ModesContext;
	  }
	| {
			value: 'enabled.reordering.dragging';
			context: ModesContext & {
				y: number;
				pointery: number;
				draggedIndex: number;
				draggedId: number;
				exerciseEls: HTMLElement[];
			};
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
			draggedId: undefined,
			exerciseEls: undefined
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
									MOVE: [
										{
											cond: 'isIntersectingPrev',
											actions: ['updateCoords', 'notifySwapPrev']
										},
										{
											cond: 'isIntersectingNext',
											actions: ['updateCoords', 'notifySwapNext']
										},
										{
											actions: ['updateCoords']
										}
									],
									SWAP: {
										actions: ['notifyReorder']
									},
									EXERCISES_REORDERED: {
										actions: ['updateIndex', 'updatePointer']
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
				const { y, index, id, exerciseEls } = event.data;
				return {
					pointery: y,
					draggedIndex: index,
					draggedId: id,
					exerciseEls
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
			notifySwapPrev: sendParent((context, event) => {
				assertEventType(event, 'MOVE');
				const draggedIndex = context.draggedIndex || 0;
				return {
					type: 'REORDER_EXERCISES',
					data: { from: draggedIndex, to: draggedIndex - 1 }
				};
			}),
			notifySwapNext: sendParent((context, event) => {
				assertEventType(event, 'MOVE');
				const draggedIndex = context.draggedIndex || 0;
				return {
					type: 'REORDER_EXERCISES',
					data: { from: draggedIndex, to: draggedIndex + 1 }
				};
			}),
			updateIndex: assign({
				draggedIndex: (_, event) => {
					assertEventType(event, 'EXERCISES_REORDERED');
					return event.data.to;
				}
			}),
			updatePointer: assign((context, event) => {
				assertEventType(event, 'EXERCISES_REORDERED');
				const { exerciseEls } = context;
				if (!exerciseEls) {
					return {
						pointery: context.pointery,
						y: context.y
					};
				}
				const draggedEl = exerciseEls[event.data.to];
				if (!draggedEl) {
					return {
						pointery: context.pointery,
						y: context.y
					};
				}
				const draggedElMidPoint = draggedEl.offsetTop + draggedEl.offsetHeight / 2;
				return {
					pointery: draggedElMidPoint,
					y: 0
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
		},
		guards: {
			isIntersectingPrev: (context, event) => {
				assertEventType(event, 'MOVE');
				const { exerciseEls, draggedIndex } = context;
				if (!exerciseEls || typeof draggedIndex === 'undefined') {
					return false;
				}
				const targetMid = getElMidPoint(exerciseEls[draggedIndex]);
				const prevElMid = getElMidPoint(exerciseEls[draggedIndex - 1]);
				return !!prevElMid && targetMid <= prevElMid;
			},
			isIntersectingNext: (context, event) => {
				assertEventType(event, 'MOVE');
				const { exerciseEls, draggedIndex } = context;
				if (!exerciseEls || typeof draggedIndex === 'undefined') {
					return false;
				}
				const targetMid = getElMidPoint(exerciseEls[draggedIndex]);
				const nextElMid = getElMidPoint(exerciseEls[draggedIndex + 1]);
				return !!nextElMid && targetMid >= nextElMid;
			}
		}
	}
);
