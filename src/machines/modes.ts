import type { Session } from 'types';
import { assign, createMachine, sendParent } from 'xstate';
import { assertEventType, getElMid, getElOffsetBottom, getElOffsetTop } from 'src/utils';

export interface ModesContext {
	history?: Partial<Session>;
	y: number;
	pointery: number;
	draggedIndex?: number;
	draggedId?: number;
	skippedElements: number;
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
	| { type: 'EXERCISES_REORDERED'; data: { newIndex: number; skipped: number } }
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
			skippedElements: 0,
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
								type: 'parallel',
								states: {
									pointer: {
										on: {
											MOVE: {
												actions: ['updateCoords']
											}
										}
									},
									item: {
										initial: 'normal',
										states: {
											normal: {
												on: {
													MOVE: [
														{
															cond: 'isIntersectingPrev',
															actions: ['notifySwapPrev'],
															target: 'swapping'
														},
														{
															cond: 'isIntersectingNext',
															actions: ['notifySwapNext'],
															target: 'swapping'
														}
													]
												}
											},
											swapping: {
												on: {
													EXERCISES_REORDERED: {
														actions: ['updateDragging'],
														target: 'normal'
													}
												}
											}
										}
									}
								},
								on: {
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
				const { draggedIndex, exerciseEls } = context;
				if (typeof draggedIndex === 'undefined' || !exerciseEls) {
					return { type: '' };
				}
				return {
					type: 'DRAGGING_INTERSECTING',
					data: { draggedIndex, intersectingIndex: draggedIndex - 1 }
				};
			}),
			notifySwapNext: sendParent((context, event) => {
				assertEventType(event, 'MOVE');
				const { draggedIndex, exerciseEls } = context;
				if (typeof draggedIndex === 'undefined' || !exerciseEls) {
					return { type: '' };
				}
				return {
					type: 'DRAGGING_INTERSECTING',
					data: { draggedIndex, intersectingIndex: draggedIndex + 1 }
				};
			}),
			updateDragging: assign((context, event) => {
				assertEventType(event, 'EXERCISES_REORDERED');
				const { exerciseEls } = context;
				const { newIndex, skipped } = event.data;
				if (!exerciseEls) {
					return {
						pointery: context.pointery,
						y: context.y,
						draggedIndex: newIndex
					};
				}
				const draggedEl = exerciseEls[event.data.newIndex];
				if (!draggedEl) {
					return {
						pointery: context.pointery,
						y: context.y,
						draggedIndex: newIndex,
						skippedElements: skipped
					};
				}
				const draggedElMidPoint = draggedEl.offsetTop + draggedEl.offsetHeight / 2;
				return {
					pointery: draggedElMidPoint,
					y: context.y + context.pointery - draggedElMidPoint,
					draggedIndex: newIndex
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
				const targetMid = getElMid(exerciseEls[draggedIndex]);
				const prevEl = exerciseEls[draggedIndex - 1];
				if (!prevEl) {
					return false;
				}
				const prevElBottom = getElOffsetBottom(prevEl);
				return targetMid <= prevElBottom;
			},
			isIntersectingNext: (context, event) => {
				assertEventType(event, 'MOVE');
				const { exerciseEls, draggedIndex } = context;
				if (!exerciseEls || typeof draggedIndex === 'undefined') {
					return false;
				}
				const targetMid = getElMid(exerciseEls[draggedIndex]);
				const nextEl = exerciseEls[draggedIndex + 1];
				if (!nextEl) {
					return false;
				}
				const nextElTop = getElOffsetTop(nextEl);
				return targetMid >= nextElTop;
			}
		}
	}
);
