import { readable } from 'svelte/store';
import { interpret } from 'xstate';

export function useMachine(machine, options) {
	const service = interpret(machine, options);

	const currentState = readable(machine.initialState, set => {
		service.onTransition(state => {
			if (state.changed) {
				set(state);
			}
		});

		service.start();

		return () => {
			service.stop();
		};
	});

	return {
		[`${machine.id}State`]: currentState,
		[`${machine.id}Send`]: service.send
	};
}
