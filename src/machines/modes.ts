import type { ExerciseInstance } from 'types';
import { createMachine } from 'xstate';

export interface ModesContext {
	instances: ExerciseInstance[];
}

export type ModesEvent = { type: 'REORDER' } | { type: 'HISTORY' } | { type: 'DELETE' };

export type ModesState =
	| {
			value: 'idle';
			context: ModesContext;
	  }
	| {
			value: 'reordering';
			context: ModesContext;
	  }
	| {
			value: 'history';
			context: ModesContext;
	  }
	| {
			value: 'deleting';
			context: ModesContext;
	  };

export const modesMachine = createMachine<ModesContext, ModesEvent, ModesState>({
	id: 'modes',
	initial: 'idle',
	states: {
		idle: {},
		reordering: {
			on: {
				REORDER: 'idle'
			}
		},
		history: {
			on: {
				HISTORY: 'idle'
			}
		},
		deleting: {
			on: {
				DELETE: 'idle'
			}
		}
	},
	on: {
		REORDER: 'reordering',
		HISTORY: 'history',
		DELETE: 'deleting'
	}
});
