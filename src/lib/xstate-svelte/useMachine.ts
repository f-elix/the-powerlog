import type { Readable } from 'svelte/store';
import type { State, StateMachine, Interpreter } from 'xstate';
import { readable } from 'svelte/store';
import { interpret } from 'xstate';

interface UseMachineStoreValue {
	state: State<any>;
	send: Interpreter<any, any, any>['send'];
	service: Interpreter<any, any, any>;
}

export type UseMachineOutput = Readable<UseMachineStoreValue>;

export const useMachine = (
	machine: StateMachine<any, any, any>,
	options = {}
): UseMachineOutput => {
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
