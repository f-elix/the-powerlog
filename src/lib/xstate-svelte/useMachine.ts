import type { Readable } from 'svelte/store';
import type { State, StateMachine, Interpreter, InterpreterOptions } from 'xstate';
import { readable } from 'svelte/store';
import { interpret } from 'xstate';
import { inspect } from '@xstate/inspect';

interface UseMachineOptions extends InterpreterOptions {
	devTools: boolean;
}

interface UseMachineStoreValue {
	state: State<any>;
	send: Interpreter<any, any, any>['send'];
	service: Interpreter<any, any, any>;
}

export type UseMachineOutput = Readable<UseMachineStoreValue>;

export const useMachine = (
	machine: StateMachine<any, any, any>,
	options?: Partial<UseMachineOptions>
): UseMachineOutput => {
	if (options && options.devTools) {
		inspect({
			iframe: false
		});
	}

	const service = interpret(machine, options);

	const store = {
		state: machine.initialState,
		send: service.send,
		service
	};

	return readable(store, (set) => {
		service.start(store.state);
		set(store);
		service.subscribe((state) => {
			if (state.changed) {
				set({
					...store,
					state
				});
			}
		});

		return () => {
			service.stop();
		};
	});
};
