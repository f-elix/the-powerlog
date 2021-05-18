import { createMachine } from 'xstate';

type ModelEvent = { type: 'CLOSE' } | { type: 'OPEN' } | { type: 'TOGGLE' };

type ModalState =
	| {
			value: 'open';
			context: never;
	  }
	| {
			value: 'closed';
			context: never;
	  };

export const modal = (id: string) =>
	createMachine<any, ModelEvent, ModalState>({
		id,
		initial: 'closed',
		states: {
			closed: {
				on: {
					OPEN: {
						target: 'open',
						actions: ['addKeydownListener']
					},
					TOGGLE: {
						target: 'open',
						actions: ['addKeydownListener']
					}
				}
			},
			open: {
				on: {
					CLOSE: {
						target: 'closed',
						actions: ['removeKeydownListener']
					},
					TOGGLE: {
						target: 'closed',
						actions: ['removeKeydownListener']
					}
				}
			}
		}
	});
