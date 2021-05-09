import type { Session } from 'types';
import { assign, createMachine, sendParent } from 'xstate';
import {
	assertEventType,
	getElMid,
	getElOffsetBottom,
	getElOffsetTop,
	getElOffsetMid,
	getToken
} from 'src/utils';

enum Intersections {
	prev = 'prev',
	next = 'next'
}

export enum ListTypes {
	perf = 'performance',
	inst = 'instance'
}

export interface ModesContext {
	history?: Partial<Session>;
	y: number;
	pointerY: number;
	clientY: number;
	draggedIndex?: number;
	draggedId?: number;
	listEls?: HTMLElement[];
	intersecting?: Intersections;
	listType?: ListTypes;
	draggedInstancePerformanceId?: number;
}

export type ModesEvent =
	| { type: 'REORDER' }
	| { type: 'HISTORY' }
	| { type: 'DELETE' }
	| { type: 'DELETE_EXERCISE'; data: { performanceId: number; instanceId: number } }
	| { type: 'EXERCISE_HISTORY'; data: { exerciseId: number; date?: string } }
	| {
			type: 'done.invoke.getHistory';
			data: Partial<Session>;
	  }
	| { type: 'DISMISS' }
	| { type: 'ENABLE' }
	| { type: 'DISABLE' }
	| {
			type: 'DRAG';
			data: {
				y: number;
				index: number;
				id: number;
				listEls: HTMLElement[];
				listType: ListTypes;
				performanceId?: number;
			};
	  }
	| { type: 'MOVE'; data: { y: number } }
	| { type: 'LIST_REORDERED'; data: { listEls: HTMLElement[] } }
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
				listEls: HTMLElement[];
			};
	  }
	| {
			value: 'enabled.history';
			context: ModesContext & {
				history: undefined;
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
			clientY: 0,
			draggedIndex: undefined,
			draggedId: undefined,
			listEls: undefined,
			intersecting: undefined,
			listType: undefined,
			draggedInstancePerformanceId: undefined
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
													LIST_REORDERED: {
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
							loaded: {}
						},
						on: {
							HISTORY: 'idle',
							DISMISS: {
								target: '.ready'
							}
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
				const { y, index, id, listEls, listType, performanceId } = event.data;
				const draggedEl = listEls[index];
				if (!draggedEl) {
					return {
						y: 0,
						pointerY: 0,
						clientY: 0,
						draggedIndex: undefined,
						draggedId: undefined,
						intersecting: undefined,
						listType: undefined,
						listEls: undefined,
						draggedInstancePerformanceId: undefined
					};
				}
				const draggedElMidPoint = getElOffsetMid(draggedEl);
				return {
					pointerY: draggedElMidPoint,
					y: y - draggedElMidPoint,
					clientY: y,
					draggedIndex: index,
					draggedId: id,
					listEls,
					listType,
					draggedInstancePerformanceId: performanceId
				};
			}),
			clearDragging: assign((_, event) => {
				assertEventType(event, 'DROP');
				return {
					y: 0,
					pointerY: 0,
					clientY: 0,
					draggedIndex: undefined,
					draggedId: undefined,
					intersecting: undefined,
					listType: undefined,
					listEls: undefined,
					draggedInstancePerformanceId: undefined
				};
			}),
			updateCoords: assign((context, event) => {
				assertEventType(event, 'MOVE');
				const { listEls, draggedIndex } = context;
				let intersecting;
				if (!listEls || typeof draggedIndex === 'undefined') {
					return {
						y: event.data.y - context.pointerY,
						clientY: event.data.y,
						intersecting
					};
				}
				const targetMid = getElMid(listEls[draggedIndex]);
				const prevEl = listEls[draggedIndex - 1];
				const prevElBottom = getElOffsetBottom(prevEl);
				const nextEl = listEls[draggedIndex + 1];
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
					clientY: event.data.y,
					intersecting
				};
			}),
			notifySwap: sendParent((context, event) => {
				assertEventType(event, 'MOVE');
				const {
					draggedIndex,
					listEls,
					intersecting,
					listType,
					draggedInstancePerformanceId
				} = context;
				if (typeof draggedIndex === 'undefined' || !listEls || !intersecting) {
					return { type: '' };
				}
				const elsLastIndex = listEls.length - 1;
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
					data: {
						draggedIndex,
						intersectingIndex,
						listType,
						performanceId: draggedInstancePerformanceId
					}
				};
			}),
			updateDragging: assign((context, event) => {
				assertEventType(event, 'LIST_REORDERED');
				const { draggedId } = context;
				const { listEls } = event.data;
				const newDraggedIndex = listEls.findIndex(
					(el) => el && parseInt(el.dataset.id || '', 10) === draggedId
				);
				if (newDraggedIndex < 0) {
					return {};
				}
				const draggedEl = listEls[newDraggedIndex];
				const newPointerY = getElOffsetMid(draggedEl);
				return {
					pointerY: newPointerY,
					y: context.clientY - newPointerY,
					draggedIndex: newDraggedIndex,
					listEls
				};
			})
		},
		services: {
			getHistory: async (_, event) => {
				assertEventType(event, 'EXERCISE_HISTORY');
				try {
					const token = await getToken();
					const { exerciseId, date } = event.data;
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
