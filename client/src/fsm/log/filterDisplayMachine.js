import { Machine } from 'xstate';

export const filterDisplayMachine = Machine({
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
					target: '#transitioning.name'
				},
				DATE_FILTER: {
					target: '#transitioning.date'
				},
				TIME_PERIOD_FILTER: {
					target: '#transitioning.timeperiod'
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
});
