import type { Session, Performance } from 'types';
import type { Interpreter } from 'xstate';
import type { ModesContext, ModesEvent, ModesState } from 'src/machines/modes';
import { createMachine, assign, send } from 'xstate';
import { assertEventType, createPerformance, getToken, reorderArray } from 'src/utils';
import { ExerciseContext, exerciseMachine } from 'src/machines/exercise';
import { modesMachine, ListTypes } from 'src/machines/modes';
import { router } from 'src/router';

export type Modes = Interpreter<ModesContext, any, ModesEvent, ModesState>;

export type SessionFormData = {
	title: string;
	date: string;
	bodyweightAmount?: string;
	bodyweightUnit: string;
};

interface SessionContext {
	session?: Session;
	editedId?: number;
}

type SessionEvent =
	| { type: 'CANCEL' }
	| { type: 'GET_SESSION'; data: { sessionId?: string } }
	| { type: 'DISPLAY'; data: { session: Session } }
	| { type: 'done.invoke.getSession'; data: { sessions_by_pk: Session } }
	| { type: 'CREATE' }
	| { type: 'EDIT'; data: { session: Session } }
	| {
			type: 'done.invoke.createSession';
			data: { insert_sessions_one: Session };
	  }
	| { type: 'done.invoke.updateSession'; data: { update_sessions_by_pk: Session } }
	| { type: 'SAVE'; data: { formData: SessionFormData } }
	| { type: 'DELETE' }
	| { type: 'done.invoke.deleteSession' }
	| { type: 'DELETE_EXERCISE'; data: { performanceId: number; instanceId: number } }
	| {
			type: 'DRAGGING_INTERSECTING';
			data: {
				draggedIndex: number;
				intersectingIndex: number;
				listType: ListTypes;
				performanceId?: number;
			};
	  }
	| { type: 'EDIT_PERFORMANCE'; data: { performanceId: number } }
	| { type: 'NEW_PERFORMANCE' }
	| { type: 'CANCEL_PERFORMANCE' }
	| { type: 'done.invoke.exercise'; data: { performance: Performance } };

type SessionState =
	| {
			value: 'idle';
			context: SessionContext & {
				session: undefined;
			};
	  }
	| {
			value: 'fetching.creating';
			context: SessionContext & {
				session: undefined;
			};
	  }
	| {
			value: 'fetching.deleting';
			context: SessionContext & {
				session: Session;
			};
	  }
	| {
			value: 'editing';
			context: SessionContext & {
				session: Session;
			};
	  }
	| {
			value: 'editing.session';
			context: SessionContext & {
				session: Session;
			};
	  }
	| {
			value: 'editing.session.creating';
			context: SessionContext & {
				session: Session;
			};
	  }
	| {
			value: 'editing.session.editing';
			context: SessionContext & {
				session: Session;
			};
	  }
	| {
			value: 'editing.exercise.creating';
			context: SessionContext & {
				session: Session;
			};
	  }
	| {
			value: 'editing.exercise.editing';
			context: SessionContext & {
				session: Session;
				editedId: number;
			};
	  }
	| {
			value: 'displaying';
			context: SessionContext & {
				session: Session;
			};
	  }
	| {
			value: 'error';
			context: SessionContext;
	  };

export const sessionMachine = createMachine<SessionContext, SessionEvent, SessionState>(
	{
		id: 'session',
		initial: 'idle',
		context: {
			session: undefined,
			editedId: undefined
		},
		invoke: {
			id: 'modes',
			src: 'modes'
		},
		states: {
			idle: {
				on: {
					CREATE: {
						target: 'fetching.creating'
					},
					EDIT: {
						target: 'editing.session.editing',
						actions: ['updateSession']
					},
					GET_SESSION: {
						target: 'fetching.session'
					},
					DISPLAY: {
						target: 'displaying',
						actions: ['updateSession']
					}
				}
			},
			fetching: {
				initial: 'creating',
				states: {
					creating: {
						invoke: {
							id: 'createSession',
							src: 'createSession',
							onDone: {
								target: '#session.editing',
								actions: ['updateSession']
							},
							onError: {
								target: '#session.error'
							}
						}
					},
					deleting: {
						invoke: {
							id: 'deleteSession',
							src: 'deleteSession',
							onDone: {
								target: '#session.idle',
								actions: ['clearSession', 'redirectToDashboard']
							},
							onError: {
								target: '#session.error'
							}
						}
					},
					saving: {
						invoke: {
							id: 'updateSession',
							src: 'updateSession',
							onDone: {
								actions: ['redirectToSessionView']
							},
							onError: {
								target: '#session.error'
							}
						}
					},
					session: {
						invoke: {
							id: 'getSession',
							src: 'getSession',
							onDone: {
								target: '#session.displaying',
								actions: ['updateSession']
							},
							onError: {
								target: '#session.error'
							}
						}
					}
				}
			},
			displaying: {
				on: {
					DELETE: {
						target: '#session.fetching.deleting',
						actions: ['redirectToDashboard']
					}
				}
			},
			editing: {
				initial: 'session',
				states: {
					session: {
						initial: 'creating',
						states: {
							creating: {
								on: {
									CANCEL: {
										target: '#session.fetching.deleting',
										actions: ['redirectToDashboard']
									}
								}
							},
							editing: {
								on: {
									CANCEL: {
										actions: ['redirectToSessionView']
									}
								}
							},
							last: {
								type: 'history'
							}
						},
						on: {
							NEW_PERFORMANCE: {
								target: '#session.editing.exercise.creating'
							},
							EDIT_PERFORMANCE: {
								target: '#session.editing.exercise.editing',
								actions: ['updateEditedId']
							},
							DELETE_EXERCISE: {
								actions: ['deleteExercise']
							},
							DRAGGING_INTERSECTING: {
								actions: ['reorderExercises']
							},
							SAVE: {
								target: '#session.fetching.saving'
							}
						}
					},
					exercise: {
						initial: 'creating',
						entry: ['disableModes'],
						states: {
							creating: {
								invoke: {
									id: 'exercise',
									src: 'exercise',
									data: (
										context: SessionContext,
										event: SessionEvent
									): ExerciseContext => {
										assertEventType(event, 'NEW_PERFORMANCE');
										const { session } = context;
										if (!session) {
											throw new Error('No session loaded');
										}
										const { id, userId } = session;
										return {
											performance: createPerformance(id),
											userId
										};
									},
									onDone: {
										target: '#session.editing.session.last',
										actions: ['addPerformance']
									}
								}
							},
							editing: {
								invoke: {
									id: 'exercise',
									src: 'exercise',
									data: (
										context: SessionContext,
										event: SessionEvent
									): ExerciseContext => {
										assertEventType(event, 'EDIT_PERFORMANCE');
										const { session } = context;
										if (!session) {
											throw new Error('No session loaded');
										}
										const { userId } = session;
										const { performanceId } = event.data;
										const performances = session.performances || [];
										const performance = performances.find(
											(perf) => perf.id === performanceId
										);
										return {
											performance,
											userId
										};
									},
									onDone: {
										target: '#session.editing.session.last',
										actions: ['updateExerciseInstances']
									}
								}
							}
						},
						on: {
							CANCEL_PERFORMANCE: {
								target: '#session.editing.session.last'
							}
						},
						exit: ['enableModes']
					}
				}
			},
			error: {}
		}
	},
	{
		actions: {
			updateSession: assign({
				session: (context, event) => {
					let session;
					if (event.type === 'EDIT' || event.type === 'DISPLAY') {
						session = event.data.session;
					}
					if (event.type === 'done.invoke.createSession') {
						session = event.data.insert_sessions_one;
					}
					if (event.type === 'done.invoke.getSession') {
						session = event.data.sessions_by_pk;
					}
					if (event.type === 'done.invoke.updateSession') {
						session = event.data.update_sessions_by_pk;
					}
					if (!session) {
						return context.session;
					}
					return session;
				}
			}),
			clearSession: assign({
				session: (_, __) => undefined
			}),
			updateEditedId: assign({
				editedId: (_, event) => {
					assertEventType(event, 'EDIT_PERFORMANCE');
					return event.data?.performanceId;
				}
			}),
			addPerformance: assign({
				session: (context, event) => {
					assertEventType(event, 'done.invoke.exercise');
					const { session } = context;
					if (!session) {
						return session;
					}
					const performances = session.performances || [];
					const updatedPerformances = [...performances, event.data.performance];
					return {
						...session,
						performances: updatedPerformances
					};
				}
			}),
			updateExerciseInstances: assign({
				session: (context, event) => {
					assertEventType(event, 'done.invoke.exercise');
					const { session, editedId } = context;
					if (!session || typeof editedId === 'undefined') {
						return session;
					}
					const performances = session.performances || [];
					const editedPerformance = event.data.performance;
					const editedPerformanceIndex = performances.findIndex(
						(perf) => perf.id === editedId
					);
					performances[editedPerformanceIndex] = editedPerformance;
					return {
						...session,
						performances
					};
				}
			}),
			deleteExercise: assign({
				session: (context, event) => {
					assertEventType(event, 'DELETE_EXERCISE');
					const { session } = context;
					if (!session) {
						return session;
					}
					const { performanceId, instanceId } = event.data;
					const performances = session.performances || [];
					const editedPerformanceIndex = performances.findIndex(
						(perf) => perf.id === performanceId
					);
					const updatedPerformance = performances[editedPerformanceIndex];
					const performanceInstances = updatedPerformance.exerciseInstances;
					updatedPerformance.exerciseInstances = performanceInstances.filter(
						(inst) => inst.id !== instanceId
					);
					let updatedPerformances = performances;
					if (!updatedPerformance.exerciseInstances.length) {
						updatedPerformances = performances.filter(
							(perf) => perf.id !== event.data.performanceId
						);
					}
					performances[editedPerformanceIndex] = updatedPerformance;
					return {
						...session,
						performances: updatedPerformances
					};
				}
			}),
			reorderExercises: assign({
				session: (context, event) => {
					assertEventType(event, 'DRAGGING_INTERSECTING');
					const { session } = context;
					if (!session) {
						return session;
					}
					const performances = session.performances || [];
					const { draggedIndex, intersectingIndex, listType, performanceId } = event.data;
					if (listType === ListTypes.perf) {
						const updatedPerformances = reorderArray(
							performances,
							draggedIndex,
							intersectingIndex
						);
						return {
							...session,
							performances: updatedPerformances
						};
					}
					const performanceIndex = performances.findIndex((p) => p.id === performanceId);
					const performance = performances[performanceIndex];
					if (listType === ListTypes.inst && performance) {
						const updatedInstances = reorderArray(
							performance.exerciseInstances,
							draggedIndex,
							intersectingIndex
						);
						performance.exerciseInstances = updatedInstances;
						performances[performanceIndex] = performance;
						return {
							...session,
							performances
						};
					}
					return session;
				}
			}),
			disableModes: send('DISABLE', { to: 'modes' }),
			enableModes: send('ENABLE', { to: 'modes' }),
			redirectToDashboard: () => {
				router.send('DASHBOARD');
			},
			redirectToSessionView: (context, event) => {
				const sessionId = `${context.session?.id || ''}`;
				if (event.type === 'CANCEL') {
					router.send({
						type: 'VIEW',
						params: { id: sessionId },
						data: { session: context.session }
					});
				}
				if (event.type === 'done.invoke.updateSession') {
					router.send({
						type: 'VIEW_UPDATED',
						params: { id: sessionId },
						data: { session: event.data.update_sessions_by_pk }
					});
				}
			}
		},
		services: {
			createSession: async (_, event) => {
				assertEventType(event, 'CREATE');
				try {
					const token = await getToken();
					const res = await fetch('/.netlify/functions/create-session', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						}
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw new Error('Problem creating session');
				}
			},
			deleteSession: async (context, event) => {
				if (event.type !== 'DELETE' && event.type !== 'CANCEL') {
					throw new Error(
						`Invalid event: expected "DELETE" or "CANCEL", got "${event.type}"`
					);
				}
				try {
					const token = await getToken();
					const id = context.session?.id;
					const res = await fetch('/.netlify/functions/delete-session', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ id })
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw new Error('Problem deleting session');
				}
			},
			updateSession: async (context, event) => {
				assertEventType(event, 'SAVE');
				try {
					const { session } = context;
					if (!session) {
						return session;
					}
					const sessionToUpdate = {
						...session,
						...event.data.formData
					};
					delete sessionToUpdate.user;
					const token = await getToken();
					const res = await fetch('/.netlify/functions/update-session', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ session: sessionToUpdate })
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw new Error('Problem saving session');
				}
			},
			getSession: async (_, event) => {
				assertEventType(event, 'GET_SESSION');
				try {
					const token = await getToken();
					const { sessionId } = event.data;
					const res = await fetch('/.netlify/functions/get-session', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ sessionId })
					});
					const data = await res.json();
					return data;
				} catch (error) {
					console.warn(error);
					throw new Error('Problem fetching session');
				}
			},
			exercise: exerciseMachine,
			modes: modesMachine
		}
	}
);
