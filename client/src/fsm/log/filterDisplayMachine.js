import { Machine, sendParent } from 'xstate';

const actions = {
	notifyParent: sendParent({ type: 'DISPLAY_CHANGE' })
};

export const filterDisplayMachine = Machine(
	{
		id: 'filterDisplay',
		initial: 'idle',
		states: {
			idle: {
				id: 'idle',
				initial: 'name',
				states: {
					name: {},
					date: {},
					timeperiod: {}
				},
				on: {
					NAME_FILTER: {
						target: '#transitioning.name',
						actions: ['notifyParent']
					},
					DATE_FILTER: {
						target: '#transitioning.date',
						actions: ['notifyParent']
					},
					TIME_PERIOD_FILTER: {
						target: '#transitioning.timeperiod',
						actions: ['notifyParent']
					}
				}
			},
			transitioning: {
				id: 'transitioning',
				initial: 'name',
				states: {
					name: {
						on: {
							TRANSITIONEND: '#idle.name'
						}
					},
					date: {
						on: {
							TRANSITIONEND: '#idle.date'
						}
					},
					timeperiod: {
						on: {
							TRANSITIONEND: '#idle.timeperiod'
						}
					}
				}
			}
		}
	},
	{
		actions
	}
);
