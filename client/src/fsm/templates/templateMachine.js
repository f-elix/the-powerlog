import { Machine, assign } from 'xstate';
import { editTemplateMachine } from './editTemplateMachine';
import { getData, getToken } from '@/assets/js/utils.js';
import { goto } from '@sapper/app';

const services = {
	getTemplate: async (_, event) => {
		const queryName = 'getTemplateById';
		const query = {
			query: `
				query getTemplate($id: ID!) {
					getTemplateById(templateId: $id) {
                        _id
                        name
                        exercises {
							_id
                            movements {
                                exercise {
                                    name
                                    _id
                                }
                                executions {
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
                        notes
					}
				}
			`,
			variables: {
				id: event.params.templateId,
			},
		};
		try {
			const token = getToken();
			const data = getData(query, queryName, token);
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
				id: context.template._id,
			},
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
};

const actions = {
	updateTemplate: assign({
		template: (_, event) => event.data,
	}),
	updateFetchError: assign({
		fetchError: (_, event) => event.data.message,
	}),
	clearFetchError: assign({
		fetchError: '',
	}),
	routeTemplates: () => {
		goto('/templates');
	},
};

export const templateMachine = Machine(
	{
		id: 'template',
		context: {
			template: {},
			fetchError: '',
		},
		initial: 'idle',
		states: {
			idle: {
				initial: 'normal',
				states: {
					normal: {},
					error: {
						exit: ['clearFetchError'],
					},
				},
				on: {
					LOAD: 'fetching',
				},
			},
			fetching: {
				invoke: {
					src: 'getTemplate',
					onDone: {
						target: 'loaded',
						actions: ['updateTemplate'],
					},
					onError: {
						target: 'idle.error',
						actions: ['updateFetchError'],
					},
				},
			},
			loaded: {
				on: {
					DELETE: {
						target: 'deleting',
						actions: ['routeTemplates'],
					},
					EDIT: {
						target: 'editing',
					},
				},
			},
			deleting: {
				invoke: {
					src: 'deleteTemplate',
					onDone: 'deleted',
					onError: 'loaded',
				},
			},
			deleted: {
				type: 'final',
			},
			editing: {
				invoke: {
					id: 'editTemplate',
					src: editTemplateMachine,
					data: {
						template: (context, _) => context.template,
					},
					onDone: {},
					onError: {},
				},
			},
		},
	},
	{
		services,
		actions,
	}
);
