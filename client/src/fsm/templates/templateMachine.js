import { Machine, assign } from 'xstate';
import { getData, getToken } from '@/assets/js/utils.js';

const services = {
	getTemplate: async (_, event) => {
		const queryName = 'getTemplateById';
		const query = {
			query: `
				query getTemplate($id: ID!) {
					getTemplateById(templateId: $id) {
                        name
                        exercises {
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
				id: event.params.templateId
			}
		};
		try {
			const token = getToken();
			const data = getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	updateTemplate: assign({
		template: (_, event) => event.data
	}),
	updateFetchError: assign({
		fetchError: (_, event) => event.data.message
	}),
	clearFetchError: assign({
		fetchError: ''
	})
};

export const templateMachine = Machine(
	{
		id: 'template',
		context: {
			template: {},
			fetchError: ''
		},
		initial: 'idle',
		states: {
			idle: {
				initial: 'normal',
				states: {
					normal: {},
					error: {
						exit: ['clearFetchError']
					}
				},
				on: {
					LOAD: 'fetching'
				}
			},
			fetching: {
				invoke: {
					src: 'getTemplate',
					onDone: {
						target: 'success',
						actions: ['updateTemplate']
					},
					onError: {
						target: 'idle.error',
						actions: ['updateFetchError']
					}
				}
			},
			success: {}
		}
	},
	{
		services,
		actions
	}
);
