import type { Session, ExerciseInstance } from 'types';
import { createMachine, assign } from 'xstate';
import { assertEventType, createExecution } from 'src/utils';
import { exerciseMachine } from 'src/machines/exercise';
import { router } from 'src/router';

interface SessionContext {
	session?: Session;
	editedInstanceId?: number;
}

type SessionEvent =
	| { type: 'VIEW'; data: { token?: string; sessionId?: string } }
	| { type: 'done.invoke.getSession'; data: { sessions_by_pk: Session } }
	| { type: 'CREATE'; data: { token?: string } }
	| {
			type: 'done.invoke.createSession';
			data: { insert_sessions_one: Session };
	  }
	| { type: 'TITLE_INPUT'; data: { value: string } }
	| { type: 'DATE_INPUT'; data: { value: string } }
	| { type: 'DELETE'; data: { token?: string } }
	| { type: 'done.invoke.deleteSession' }
	| { type: 'EDIT_EXERCISE'; data?: { instanceId: number } }
	| { type: 'CANCEL_EXERCISE' }
	| { type: 'done.invoke.exercise'; data: { exercise: ExerciseInstance } }
	| { type: 'SAVE'; data: { token?: string } };

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
			value: 'editing.exercise';
			context: SessionContext & {
				session: Session;
				editedInstanceId: number;
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
			session: undefined
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
						on: {
							TITLE_INPUT: {
								actions: ['updateTitle']
							},
							DATE_INPUT: {
								actions: ['updateDate']
							},
							DELETE: {
								target: '#session.fetching.deleting',
								actions: ['redirectToDashboard']
							},
							EDIT_EXERCISE: {
								target: 'exercise',
								actions: ['updateEditedInstanceId']
							},
							SAVE: {
								target: '#session.fetching.saving'
							}
						}
					},
					exercise: {
						invoke: {
							id: 'exercise',
							src: 'exercise',
							data: {
								instance: (context: SessionContext, event: SessionEvent) => {
									assertEventType(event, 'EDIT_EXERCISE');
									const { session } = context;
									if (!session) {
										return {};
									}
									const instanceId = event.data?.instanceId;
									if (!instanceId) {
										return {
											sessionId: session.id,
											executions: [createExecution(1)]
										};
									}
									const instances = session.exercises || [];
									const exerciseInstance = instances.find(
										(instance) => instance.id === instanceId
									);
									if (!exerciseInstance) {
										return {};
									}
									return exerciseInstance;
								},
								userId: (context: SessionContext) => context.session?.userId
							},
							onDone: {
								target: 'session',
								actions: ['updateExercises']
							}
						},
						on: {
							CANCEL_EXERCISE: {
								target: 'session'
							}
						},
						exit: ['clearEditedInstanceId']
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
			updateTitle: assign({
				session: (context, event) => {
					assertEventType(event, 'TITLE_INPUT');
					const { session } = context;
					if (!session) {
						return undefined;
					}
					return {
						...session,
						title: event.data.value
					};
				}
			}),
			updateDate: assign({
				session: (context, event) => {
					assertEventType(event, 'DATE_INPUT');
					const { session } = context;
					if (!session) {
						return undefined;
					}
					return {
						...session,
						date: event.data.value
					};
				}
			}),
			updateEditedInstanceId: assign({
				editedInstanceId: (_, event) => {
					assertEventType(event, 'EDIT_EXERCISE');
					return event.data?.instanceId;
				}
			}),
			clearEditedInstanceId: assign({
				editedInstanceId: (_, __) => undefined
			}),
			updateExercises: assign({
				session: (context, event) => {
					assertEventType(event, 'done.invoke.exercise');
					const { session } = context;
					if (!session) {
						return undefined;
					}
					const exercises = session?.exercises || [];
					const updatedExercises = [...exercises, event.data.exercise];
					return {
						...session,
						exercises: updatedExercises
					};
				}
			}),
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
				assertEventType(event, 'DELETE');
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
					const sessionToUpdate = session;
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
			exercise: exerciseMachine
		}
	}
);
