import type { Session, Performance } from 'types';
import type { Interpreter } from 'xstate';
import type { ModesContext, ModesEvent, ModesState } from 'src/machines/modes';
import { createMachine, assign, send } from 'xstate';
import { assertEventType, createExerciseInstance, generateId, reorderArray } from 'src/utils';
import { ExerciseContext, exerciseMachine } from 'src/machines/exercise';
import { modesMachine } from 'src/machines/modes';
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
	| { type: 'CANCEL'; data: { token?: string } }
	| { type: 'VIEW'; data: { token?: string; sessionId?: string } }
	| { type: 'done.invoke.getSession'; data: { sessions_by_pk: Session } }
	| { type: 'CREATE'; data: { token?: string } }
	| { type: 'EDIT' }
	| {
			type: 'done.invoke.createSession';
			data: { insert_sessions_one: Session };
	  }
	| { type: 'SAVE'; data: { token: string; formData: SessionFormData } }
	| { type: 'DELETE'; data: { token?: string } }
	| { type: 'done.invoke.deleteSession' }
	| { type: 'DELETE_PERFORMANCE'; data: { performanceId: number } }
	| { type: 'DRAGGING_INTERSECTING'; data: { draggedIndex: number; intersectingIndex: number } }
	| { type: 'EDIT_PERFORMANCE'; data: { performanceId: number } }
	| { type: 'NEW_EXERCISE' }
	| { type: 'CANCEL_EXERCISE' }
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
					VIEW: {
						target: 'fetching.session'
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
								target: '#session.idle',
								actions: ['clearSession']
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
					EDIT: {
						target: 'editing.session.editing'
					},
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
										target: '#session.idle',
										actions: ['redirectToDashboard']
									}
								}
							},
							last: {
								type: 'history'
							}
						},
						on: {
							NEW_EXERCISE: {
								target: '#session.editing.exercise.creating'
							},
							EDIT_PERFORMANCE: {
								target: '#session.editing.exercise.editing',
								actions: ['updateEditedId']
							},
							DELETE_PERFORMANCE: {
								actions: ['deletePerformance']
							},
							DRAGGING_INTERSECTING: {
								actions: ['reorderExercises', 'notifyReordered']
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
										assertEventType(event, 'NEW_EXERCISE');
										const { session } = context;
										if (!session) {
											throw new Error('No session loaded');
										}
										const { id, userId } = session;
										return {
											performance: {
												id: generateId(),
												sessionId: id,
												exerciseInstances: [createExerciseInstance(id)]
											},
											userId
										};
									},
									onDone: {
										target: '#session.editing.session.last',
										actions: ['addExerciseInstance']
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
							CANCEL_EXERCISE: {
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
					if (event.type === 'done.invoke.createSession') {
						session = event.data.insert_sessions_one;
					}
					if (event.type === 'done.invoke.getSession') {
						session = event.data.sessions_by_pk;
					}
					if (!session) {
						return context.session;
					}
					return {
						...session,
						date: new Date(session.date).toLocaleDateString('en-CA')
					};
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
			addExerciseInstance: assign({
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
			deletePerformance: assign({
				session: (context, event) => {
					assertEventType(event, 'DELETE_PERFORMANCE');
					const { session } = context;
					if (!session) {
						return session;
					}
					const performances = session.performances || [];
					const updatedPerformances = performances.filter(
						(perf) => perf.id !== event.data.performanceId
					);
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
					const { draggedIndex, intersectingIndex } = event.data;
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
			}),
			notifyReordered: send(
				(_, event) => {
					assertEventType(event, 'DRAGGING_INTERSECTING');
					return {
						type: 'EXERCISES_REORDERED',
						data: {
							newIndex: event.data.intersectingIndex
						}
					};
				},
				{ to: 'modes' }
			),
			disableModes: send('DISABLE', { to: 'modes' }),
			enableModes: send('ENABLE', { to: 'modes' }),
			redirectToDashboard: () => {
				router.send('DASHBOARD');
			}
		},
		services: {
			createSession: async (_, event) => {
				assertEventType(event, 'CREATE');
				try {
					const { token } = event.data;
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
					const id = context.session?.id;
					const { token } = event.data;
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
						return;
					}
					const sessionToUpdate = {
						...session,
						...event.data.formData
					};
					delete sessionToUpdate.user;
					const { token } = event.data;
					await fetch('/.netlify/functions/update-session', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ session: sessionToUpdate })
					});
				} catch (error) {
					console.warn(error);
					throw new Error('Problem saving session');
				}
			},
			getSession: async (_, event) => {
				assertEventType(event, 'VIEW');
				try {
					const { token, sessionId } = event.data;
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
