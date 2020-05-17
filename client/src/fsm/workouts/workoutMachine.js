import { Machine, assign } from 'xstate';
import { editWorkoutMachine } from './editWorkoutMachine';
import { getData, getToken } from '@/js/utils.js';

const services = {
	getTemplate: async (_, event) => {
		const queryName = 'getTemplateById';
		const query = {
			query: `
				query getTemplate($id: ID!) {
					getTemplateById(templateId: $id) {
                        _id
						name
						instructions
                        exercises {
							_id
                            movements {
                                exercise {
                                    _id
                                    name
                                }
                                executions {
									_id
                                    sets
                                    reps
                                    time {
                                        amount
                                        unit
                                    }
                                    load {
                                        amount
                                        unit
                                    }
                                }
                            }
                        }
					}
				}
			`,
			variables: {
				id: event.params.templateId
			}
		};
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	deleteTemplate: async (context, _) => {
		const queryName = 'deleteTemplate';
		const query = {
			query: `
				mutation deleteTemplate($id: ID!) {
					deleteTemplate(templateId: $id)
				}
			`,
			variables: {
				id: context.workoutData._id
			}
		};
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	getSession: async (_, event) => {
		const queryName = 'getSessionById';
		const query = {
			query: `
				query getSession($id: ID!) {
					getSessionById(sessionId: $id) {
                        _id
						date
						name
						notes
						templateInstructions
                        exercises {
							_id
                            movements {
                                exercise {
                                    _id
                                    name
                                }
                                executions {
									_id
                                    sets
                                    reps
                                    time {
                                        amount
                                        unit
                                    }
                                    load {
                                        amount
                                        unit
                                    }
                                }
                            }
                        }
					}
				}
			`,
			variables: {
				id: event.params.sessionId
			}
		};
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	deleteSession: async (context, _) => {
		const queryName = 'deleteSession';
		const query = {
			query: `
				mutation deleteSession($id: ID!) {
					deleteSession(sessionId: $id)
				}
			`,
			variables: {
				id: context.workoutData._id
			}
		};
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	updateWorkoutData: assign({
		workoutData: (context, event) => {
			if (!event.data) {
				return context.workoutData;
			}
			return event.data.workoutData || event.data;
		}
	}),
	updateFetchError: assign({
		fetchError: (_, event) => event.data.message
	}),
	clearFetchError: assign({
		fetchError: ''
	})
};

export const workoutMachine = Machine(
	{
		id: 'workout',
		context: {
			workoutData: {},
			fetchError: ''
		},
		initial: 'idle',
		states: {
			idle: {
				id: 'idle',
				initial: 'normal',
				states: {
					normal: {},
					error: {
						exit: ['clearFetchError']
					}
				},
				on: {
					LOAD_SESSION: 'fetching.session',
					LOAD_TEMPLATE: 'fetching.template'
				}
			},
			fetching: {
				initial: 'session',
				states: {
					session: {
						invoke: {
							src: 'getSession',
							onDone: {
								target: '#displaying',
								actions: ['updateWorkoutData']
							},
							onError: {
								target: '#idle.error',
								actions: ['updateFetchError']
							}
						}
					},
					template: {
						invoke: {
							src: 'getTemplate',
							onDone: {
								target: '#displaying',
								actions: ['updateWorkoutData']
							},
							onError: {
								target: '#idle.error',
								actions: ['updateFetchError']
							}
						}
					}
				}
			},
			displaying: {
				id: 'displaying',
				on: {
					DELETE_TEMPLATE: {
						target: 'deleting.template'
					},
					DELETE_SESSION: {
						target: 'deleting.session'
					},
					EDIT: {
						target: 'transitioning'
					}
				}
			},
			editing: {
				invoke: {
					id: 'editWorkout',
					src: editWorkoutMachine.withConfig({
						actions: {
							routeLog: () => $goto('/log'),
							routeTemplates: () => $goto('/templates')
						}
					}),
					data: {
						workout: (context, _) => {
							return { ...context.workoutData };
						}
					},
					onDone: {
						target: 'displaying',
						actions: ['updateWorkoutData']
					}
				},
				on: {
					CANCEL: {
						target: 'transitioning'
					}
				}
			},
			transitioning: {
				on: {
					DISPLAY_OUT: 'editing',
					EDIT_OUT: 'displaying'
				}
			},
			deleting: {
				initial: 'session',
				states: {
					session: {
						invoke: {
							src: 'deleteSession',
							onDone: {
								target: '#deleted',
								actions: ['routeLog']
							},
							onError: '#displaying'
						}
					},
					template: {
						invoke: {
							src: 'deleteTemplate',
							onDone: {
								target: '#deleted',
								actions: ['routeTemplates']
							},
							onError: '#displaying'
						}
					}
				}
			},
			deleted: {
				id: 'deleted',
				type: 'final'
			}
		}
	},
	{
		services,
		actions
	}
);
