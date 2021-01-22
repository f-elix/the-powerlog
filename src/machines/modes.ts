import type { Session } from 'types';
import { assign, createMachine, sendParent } from 'xstate';
import { assertEventType, getElMid, getElOffsetBottom, getElOffsetTop } from 'src/utils';

enum Intersections {
	prev = 'prev',
	next = 'next'
}

export interface ModesContext {
	history?: Partial<Session>;
	y: number;
	pointerY: number;
	pageY: number;
	draggedIndex?: number;
	draggedId?: number;
	exerciseEls?: HTMLElement[];
	intersecting?: Intersections;
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
	| { type: 'EXERCISES_REORDERED'; data: { exerciseEls: HTMLElement[] } }
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
				pointerY: number;
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
			pointerY: 0,
			pageY: 0,
			draggedIndex: undefined,
			draggedId: undefined,
			exerciseEls: undefined,
			intersecting: undefined
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
													MOVE: {
														cond: 'isIntersecting',
														target: 'intersecting'
													}
												}
											},
											intersecting: {
												entry: ['notifySwap'],
												on: {
													MOVE: [
														{
															cond: 'isIntersecting',
															internal: true
														},
														{
															target: 'normal'
														}
													],
													EXERCISES_REORDERED: {
														actions: ['updateDragging']
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
				const draggedEl = exerciseEls[index];
				const draggedElMidPoint = draggedEl.offsetTop + draggedEl.offsetHeight / 2;
				return {
					pointerY: draggedElMidPoint,
					y: y - draggedElMidPoint,
					pageY: y,
					draggedIndex: index,
					draggedId: id,
					exerciseEls
				};
			}),
			clearDragging: assign((_, event) => {
				assertEventType(event, 'DROP');
				return {
					y: 0,
					pointerY: 0,
					pageY: 0,
					draggedIndex: undefined,
					draggedId: undefined,
					intersecting: undefined
				};
			}),
			updateCoords: assign((context, event) => {
				assertEventType(event, 'MOVE');
				const { exerciseEls, draggedIndex } = context;
				let intersecting;
				if (!exerciseEls || typeof draggedIndex === 'undefined') {
					return {
						y: event.data.y - context.pointerY,
						pageY: event.data.y,
						intersecting
					};
				}
				const targetMid = getElMid(exerciseEls[draggedIndex]);
				const prevEl = exerciseEls[draggedIndex - 1];
				const prevElBottom = getElOffsetBottom(prevEl);
				const nextEl = exerciseEls[draggedIndex + 1];
				const nextElTop = getElOffsetTop(nextEl);
				const isIntersectingPrev = !!prevEl && targetMid <= prevElBottom;
				const isIntersectingNext = !!nextEl && targetMid >= nextElTop;
				if (isIntersectingPrev) {
					intersecting = Intersections.prev;
				} else if (isIntersectingNext) {
					intersecting = Intersections.next;
				}
				return {
					y: event.data.y - context.pointerY,
					pageY: event.data.y,
					intersecting
				};
			}),
			notifySwap: sendParent((context, event) => {
				assertEventType(event, 'MOVE');
				const { draggedIndex, exerciseEls, intersecting } = context;
				if (typeof draggedIndex === 'undefined' || !exerciseEls || !intersecting) {
					return { type: '' };
				}
				const elsLastIndex = exerciseEls.length - 1;
				let intersectingIndex = draggedIndex;
				if (intersecting === Intersections.prev) {
					const prevIndex = draggedIndex - 1 < 0 ? 0 : draggedIndex - 1;
					intersectingIndex = prevIndex;
				} else if (intersecting === Intersections.next) {
					const nextIndex =
						draggedIndex + 1 > elsLastIndex ? elsLastIndex : draggedIndex + 1;
					intersectingIndex = nextIndex;
				}
				return {
					type: 'DRAGGING_INTERSECTING',
					data: { draggedIndex, intersectingIndex }
				};
			}),
			updateDragging: assign((context, event) => {
				assertEventType(event, 'EXERCISES_REORDERED');
				const { draggedId } = context;
				const { exerciseEls } = event.data;
				const newDraggedIndex = exerciseEls.findIndex(
					(el) => parseInt(el.dataset.id || '', 10) === draggedId
				);
				const draggedEl = exerciseEls[newDraggedIndex];
				const newPointerY = draggedEl.offsetTop + draggedEl.offsetHeight / 2;
				return {
					pointerY: newPointerY,
					y: context.pageY - newPointerY,
					draggedIndex: newDraggedIndex
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
			isIntersecting: (context) => !!context.intersecting
		}
	}
);
