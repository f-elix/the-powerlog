import type { Session } from 'types';
import { createMachine, assign } from 'xstate';
import { assertEventType, isTouchDevice } from 'src/utils';

interface FilterData {
	token?: string;
	filterType?: string;
	value?: Record<string, string | number>;
	debounce?: boolean;
}

interface FiltersContext {
	sessions: Session[];
	filterData?: FilterData;
}

type FiltersEvent =
	| {
			type: 'FILTER';
			data: FilterData;
	  }
	| { type: 'CLEAR' }
	| { type: 'done.invoke.filter'; data: { sessions: Session[] } };

type FiltersState =
	| {
			value: 'idle.clear';
			context: FiltersContext;
	  }
	| {
			value: 'idle.error';
			context: FiltersContext;
	  }
	| {
			value: 'debouncing';
			context: FiltersContext;
	  }
	| {
			value: 'fetching';
			context: FiltersContext;
	  }
	| {
			value: 'loaded';
			context: FiltersContext;
	  };

export const filtersMachine = createMachine<FiltersContext, FiltersEvent, FiltersState>(
	{
		id: 'filters',
		initial: 'idle',
		context: {
			sessions: [],
			filterData: {}
		},
		states: {
			idle: {
				initial: 'clear',
				states: {
					clear: {},
					error: {}
				}
			},
			debouncing: {
				after: {
					DEBOUNCE_DELAY: {
						target: 'fetching'
					}
				}
			},
			fetching: {
				invoke: {
					id: 'filter',
					src: 'filter',
					onDone: {
						target: 'loaded',
						actions: ['updateSessions']
					},
					onError: 'idle.error'
				}
			},
			loaded: {}
		},
		on: {
			FILTER: [
				{
					cond: 'debounce',
					target: 'debouncing',
					actions: ['updateFilterData']
				},
				{
					target: 'fetching',
					actions: ['updateFilterData']
				}
			],
			CLEAR: {
				target: 'idle.clear',
				actions: ['clearSessions', 'clearFilters']
			}
		}
	},
	{
		actions: {
			updateFilterData: assign({
				filterData: (_, event) => {
					assertEventType(event, 'FILTER');
					return event.data;
				}
			}),
			updateSessions: assign({
				sessions: (_, event) => {
					assertEventType(event, 'done.invoke.filter');
					return event.data.sessions;
				}
			}),
			clearSessions: assign({
				sessions: (_, __) => []
			}),
			clearFilters: () => {
				const filterCtn = <HTMLDivElement>document.querySelector('#filters');
				if (!filterCtn) {
					return;
				}
				filterCtn.querySelectorAll('input').forEach((i) => {
					const input = i;
					input.value = '';
				});
			}
		},
		services: {
			filter: async (context) => {
				try {
					const { token, filterType, value } = context.filterData || {};
					const res = await fetch('/.netlify/functions/filter-sessions', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({ filterType, value })
					});
					const data = await res.json();
					if (!data.sessions.length) {
						throw new Error('No sessions found');
					}
					return data;
				} catch (error) {
					console.warn(error);
					throw new Error('No sessions found');
				}
			}
		},
		guards: {
			debounce: (_, event) => {
				assertEventType(event, 'FILTER');
				return event.data.debounce || false;
			}
		},
		delays: {
			DEBOUNCE_DELAY: () => (isTouchDevice() ? 800 : 450)
		}
	}
);
