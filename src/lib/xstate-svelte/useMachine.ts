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

	const currentState = {
		state: machine.initialState,
		send: service.send,
		service
	};

	return readable(currentState, (set) => {
		service.start(currentState.state);
		set(currentState);
		service.subscribe((state) => {
			if (state.changed) {
				set({
					...currentState,
					state
				});
			}
		});

		return () => {
			service.stop();
		};
	});
};
