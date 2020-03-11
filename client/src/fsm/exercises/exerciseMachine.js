import { Machine, assign } from 'xstate';

export const exerciseMachine = exercise => {
	return Machine({
		id: 'exercise',
		context: {
			exercise
		},
		initalState: 'idle',
		states: {
			idle: {}
		}
	});
};
