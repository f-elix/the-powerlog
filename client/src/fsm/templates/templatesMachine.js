import { Machine, assign } from 'xstate';
import { getData, getToken } from '@/assets/js/utils.js';

const services = {
	getTemplates: async () => {
		const queryName = 'getAllTemplates';
		const query = {
			query: `
                {
                    getAllTemplates {
                        _id
                        name
                    }
                }
            `
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
	deleteTemplate: async (_, event) => {
		const queryName = 'deleteTemplate';
		const query = {
			query: `
				mutation deleteTemplate($id: ID!) {
					deleteTemplate(templateId: $id)
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
	}
};

const actions = {
	updateTemplates: assign({
		templates: (_, event) => event.data
	}),
	removeTemplate: assign({
		templates: (context, event) => {
			return context.templates.filter(t => {
				return t._id !== event.params.templateId;
			});
		}
	})
};

export const templatesMachine = Machine(
	{
		id: 'templates',
		context: {
			templates: []
		},
		initial: 'idle',
		states: {
			idle: {
				on: {
					LOAD: 'fetching',
					DELETE: {
						target: 'deleting',
						actions: ['removeTemplate']
					}
				}
			},
			fetching: {
				invoke: {
					src: 'getTemplates',
					onDone: {
						target: 'idle',
						actions: ['updateTemplates']
					},
					onError: 'idle'
				}
			},
			deleting: {
				invoke: {
					src: 'deleteTemplate',
					onDone: 'idle',
					onError: 'idle'
				}
			}
		}
	},
	{
		actions,
		services
	}
);
