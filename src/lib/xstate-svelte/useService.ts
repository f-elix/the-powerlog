import type { Readable } from 'svelte/store';
import type { State, Interpreter } from 'xstate';
import { readable } from 'svelte/store';

interface UseServiceStoreValue {
	state: State<any>;
	send: Interpreter<any, any, any>['send'];
	service: Interpreter<any, any, any>;
}

export type UseServiceOutput = Readable<UseServiceStoreValue>;

export const useService = (service: Interpreter<any, any, any>): UseServiceOutput => {
	const currentState = {
		state: service.state,
		send: service.send,
		service
	};

	return readable(currentState, (setState) => {
		const { unsubscribe } = service.subscribe((state) => {
			if (state.changed !== false) {
				setState({
					...currentState,
					state
				});
			}
		});

		return (): void => unsubscribe();
	});
};
