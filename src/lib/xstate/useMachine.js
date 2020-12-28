import { readable } from 'svelte/store';
import { interpret } from 'xstate';

export const useMachine = (machine, options = {}) => {
	const service = interpret(machine, options);

	// if (
	// 	process.env.NODE_ENV === 'development' &&
	// 	typeof window !== 'undefined' &&
	// 	options.devTools
	// ) {
	// 	inspect({
	// 		iframe: false
	// 	});
	// }

	const currentState = {
		state: machine.initialState,
		send: service.send,
		service
	};

	return readable(currentState, (set) => {
		service.subscribe((state) => {
			if (state.changed) {
				set({
					...currentState,
					state
				});
			}
		});

		service.start();
		service.send('INIT');

		return () => {
			service.stop();
		};
	});
};
