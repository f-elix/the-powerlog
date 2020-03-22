import { Machine, assign, sendParent } from 'xstate';

export const editExerciseMachine = exercise => {
	return Machine({
		id: 'editExercise',
		context: {
			exercise
		},
		initial: 'idle',
		states: {
			idle: {
				on: {}
			}
		}
	});
};
