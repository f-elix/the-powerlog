import { Machine, assign } from 'xstate';

export const filters = {
	name: 'name',
	date: 'date',
	period: 'period'
};

const actions = {
	updateCurrentFilter: assign({ currentFilter: (_, event) => event.params.filter })
};

export const filterDisplayMachine = Machine(
	{
		id: 'filterDisplay',
		context: {
			currentFilter: filters.name
		},
		initial: 'idle',
		states: {
			idle: {
				on: {
					CHANGE: {
						target: 'transitioning',
						actions: ['updateCurrentFilter']
					}
				}
			},
			transitioning: {
				on: {
					TRANSITIONEND: 'idle'
				}
			}
		}
	},
	{
		actions
	}
);
