import { readable } from 'svelte/store';

export function useService(service) {
	const currentState = readable(service.initialState, set => {
		service.subscribe(state => {
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
		[`${service.machine.id}State`]: currentState,
		[`${service.machine.id}Send`]: service.send
	};
}
