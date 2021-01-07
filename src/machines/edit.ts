import type { Session, ExerciseInstance, Exercise } from 'types';
import { createMachine, assign } from 'xstate';
import { assertEventType, createExecution } from 'src/utils';
import { exerciseMachine } from 'src/machines/exercise';
import { router } from 'src/router';

interface EditContext {
	session?: Session;
	exercises: Exercise[];
	editedInstanceId?: number;
}

type EditEvent =
	| { type: 'CREATE'; data: { token?: string } }
	| {
			type: 'done.invoke.createSession';
			data: { insert_sessions_one: Session; exercises: Exercise[] };
	  }
	| { type: 'TITLE_INPUT'; data: { value: string } }
	| { type: 'DATE_INPUT'; data: { value: string } }
	| { type: 'DELETE'; data: { token?: string } }
	| { type: 'done.invoke.deleteSession' }
	| { type: 'EDIT_EXERCISE'; data?: { instanceId: number } }
	| { type: 'CANCEL_EXERCISE' }
	| { type: 'done.invoke.exercise'; data: { exercise: ExerciseInstance } }
	| { type: 'SAVE'; data: { token?: string } };

type EditState =
	| {
			value: 'idle';
			context: EditContext & {
				session: undefined;
			};
	  }
	| {
			value: 'fetching.creating';
			context: EditContext & {
				session: undefined;
			};
	  }
	| {
			value: 'fetching.deleting';
			context: EditContext & {
				session: Session;
			};
	  }
	| {
			value: 'editing';
			context: EditContext & {
				session: Session;
			};
	  }
	| {
			value: 'error';
			context: EditContext;
	  };

export const editMachine = createMachine<EditContext, EditEvent, EditState>(
	{
		id: 'edit',
		initial: 'idle',
		context: {
			session: undefined,
			exercises: []
		},
		states: {
			idle: {
				on: {
					CREATE: {
						target: 'fetching.creating'
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
								target: '#edit.editing',
								actions: ['updateContext']
							},
							onError: {
								target: '#edit.error'
							}
						}
					},
					deleting: {
						invoke: {
							id: 'deleteSession',
							src: 'deleteSession',
							onDone: {
								target: '#edit.idle',
								actions: ['clearSession', 'redirectToDashboard']
							},
							onError: {
								target: '#edit.error'
							}
						}
					},
					saving: {
						invoke: {
							id: 'updateSession',
							src: 'updateSession',
							onDone: {
								target: '#edit.idle',
								actions: ['clearSession', 'redirectToDashboard']
							},
							onError: {
								target: '#edit.error'
							}
						}
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
								target: '#edit.fetching.deleting'
							},
							EDIT_EXERCISE: {
								target: 'exercise',
								actions: ['updateEditedInstanceId']
							},
							SAVE: {
								target: '#edit.fetching.saving'
							}
						}
					},
					exercise: {
						invoke: {
							id: 'exercise',
							src: 'exercise',
							data: {
								instance: (context: EditContext, event: EditEvent) => {
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
								userId: (context: EditContext) => context.session?.userId
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
			updateContext: assign({
				session: (_, event) => {
					assertEventType(event, 'done.invoke.createSession');
					const session = event.data.insert_sessions_one;
					return {
						...session,
						date: new Date(session.date).toLocaleDateString('en-CA')
					};
				},
				exercises: (_, event) => {
					assertEventType(event, 'done.invoke.createSession');
					const session = event.data.insert_sessions_one;
					return session.user?.exercises || [];
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
			exercise: exerciseMachine
		}
	}
);
