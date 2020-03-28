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
	}
};

const actions = {
	updateTemplates: assign({
		templates: (_, event) => event.data
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
					LOAD: 'fetching'
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
			}
		}
	},
	{
		actions,
		services
	}
);
