import { createMachine } from 'xstate';
import { createModel } from 'xstate/lib/model';

const modalModel = createModel(
	{},
	{
		events: {
			OPEN: () => ({ value: 'OPEN' }),
			CLOSE: () => ({ value: 'CLOSE' }),
			TOGGLE: () => ({ value: 'TOGGLE' })
		}
	}
);

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
	createMachine<typeof modalModel, ModalState>({
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
