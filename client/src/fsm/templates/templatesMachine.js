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
	}),
	updateSearchFilter: assign({
		searchFilter: (_, event) => event.params.value
	}),
	resetTemplates: assign({
		filteredTemplates: null
	}),
	filterTemplates: assign({
		filteredTemplates: (context, _) => {
			return context.templates.filter(t => {
				return t.name
					.trim()
					.toLowerCase()
					.includes(context.searchFilter.trim().toLowerCase());
			});
		}
	}),
	updateFetchError: assign({
		fetchError: (_, event) => event.data.message
	}),
	clearFetchError: assign({
		fetchError: ''
	})
};

const guards = {
	isSearchFilterEmpty: (context, _) => context.searchFilter.trim().length === 0
};

export const templatesMachine = Machine(
	{
		id: 'templates',
		context: {
			templates: [],
			filteredTemplates: null,
			searchFilter: '',
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
					LOAD: 'fetching',
					DELETE: {
						target: 'deleting',
						actions: ['removeTemplate']
					},
					SEARCH_INPUT: {
						target: 'filtering',
						actions: ['updateSearchFilter']
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
					onError: {
						target: 'idle.error',
						actions: ['updateFetchError']
					}
				}
			},
			filtering: {
				on: {
					'': [
						{
							cond: 'isSearchFilterEmpty',
							target: 'idle',
							actions: ['resetTemplates']
						},
						{
							target: 'idle',
							actions: ['filterTemplates']
						}
					]
				}
			},
			deleting: {
				invoke: {
					src: 'deleteTemplate',
					onDone: 'idle',
					onError: {
						target: 'idle.error',
						actions: ['updateFetchError']
					}
				}
			}
		}
	},
	{
		actions,
		services,
		guards
	}
);
