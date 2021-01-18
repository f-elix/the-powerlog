import type { Session, ExerciseInstance } from 'types';
import type { Interpreter } from 'xstate';
import type { ModesContext, ModesEvent, ModesState } from 'src/machines/modes';
import { createMachine, assign, send } from 'xstate';
import {
	assertEventType,
	createExerciseInstance,
	findNextIndex,
	generateId,
	reorderArray
} from 'src/utils';
import { exerciseMachine } from 'src/machines/exercise';
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
	drag: {
		newDragIndex?: number;
	};
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
	| { type: 'DELETE_EXERCISE'; data: { instanceId: number } }
	| { type: 'DRAGGING_INTERSECTING'; data: { draggedIndex: number; intersectingIndex: number } }
	| { type: 'EDIT_EXERCISE'; data: { instanceId: number } }
	| { type: 'NEW_EXERCISE' }
	| { type: 'CANCEL_EXERCISE' }
	| { type: 'done.invoke.exercise'; data: { instances: ExerciseInstance[] } };

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
			editedId: undefined,
			drag: {
				newDragIndex: undefined
			}
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
							EDIT_EXERCISE: {
								target: '#session.editing.exercise.editing',
								actions: ['updateEditedId']
							},
							DELETE_EXERCISE: {
								actions: ['deleteExercise']
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
									data: (context: SessionContext, event: SessionEvent) => {
										assertEventType(event, 'NEW_EXERCISE');
										const { session } = context;
										if (!session) {
											return {};
										}
										const { id, userId } = session;
										return {
											instances: [createExerciseInstance(id)],
											userId,
											sessionId: id,
											supersetId: generateId()
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
									data: (context: SessionContext, event: SessionEvent) => {
										assertEventType(event, 'EDIT_EXERCISE');
										const { session } = context;
										if (!session) {
											return {};
										}
										const { userId, id } = session;
										const { instanceId } = event.data;
										const instances = session.exercises || [];
										const instance = instances.find(
											(inst) => inst.id === instanceId
										);
										if (!instance) {
											return {};
										}
										const { supersetId } = instance;
										if (!supersetId) {
											return {
												instances: [instance],
												userId,
												sessionId: id,
												supersetId
											};
										}
										const supersetInstances = instances.filter(
											(inst) => inst.supersetId === supersetId
										);
										return {
											instances: supersetInstances,
											userId,
											sessionId: id,
											supersetId
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
					assertEventType(event, 'EDIT_EXERCISE');
					return event.data?.instanceId;
				}
			}),
			addExerciseInstance: assign({
				session: (context, event) => {
					assertEventType(event, 'done.invoke.exercise');
					const { session } = context;
					if (!session) {
						return session;
					}
					const exercises = session.exercises || [];
					const updatedExercises = [...exercises, ...event.data.instances];
					return {
						...session,
						exercises: updatedExercises
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
					const exercises = session.exercises || [];
					const editedInstances = event.data.instances;
					editedInstances.forEach((instance) => {
						const exerciseIndex = exercises.findIndex(
							(sessionEx) => sessionEx.id === instance.id
						);
						exercises[exerciseIndex] = instance;
					});
					return {
						...session,
						exercises
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
					const exercises = session.exercises || [];
					const updatedExercises = exercises.filter(
						(inst) => inst.id !== event.data.instanceId
					);
					return {
						...session,
						exercises: updatedExercises
					};
				}
			}),
			reorderExercises: assign((context, event) => {
				assertEventType(event, 'DRAGGING_INTERSECTING');
				const { session } = context;
				if (!session) {
					return {};
				}
				const exercises = session.exercises || [];
				const { draggedIndex, intersectingIndex } = event.data;
				const newIndex = findNextIndex(exercises, draggedIndex, intersectingIndex);
				const updatedExercises = reorderArray(exercises, draggedIndex, newIndex);
				return {
					session: {
						...session,
						exercises: updatedExercises
					},
					drag: {
						newDragIndex: newIndex
					}
				};
			}),
			notifyReordered: send(
				(context, event) => {
					assertEventType(event, 'DRAGGING_INTERSECTING');
					return {
						type: 'EXERCISES_REORDERED',
						data: {
							newIndex: context.drag.newDragIndex
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
