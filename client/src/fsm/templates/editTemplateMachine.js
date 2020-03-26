import { Machine, assign } from 'xstate';
import { editExerciseMachine } from './editExerciseMachine';

const actions = {
	updateTemplateName: assign({
		templateName: (_, event) => event.params.value
	}),
	addExercise: assign({
		exercises: (context, event) => {
			const exercise = event.params.newExercise;
			if (!exercise) {
				return context.exercises;
			}
			const newExercise = {
				movements: [
					{
						exercise: exercise,
						executions: []
					}
				]
			};
			return [...context.exercises, newExercise];
		}
	})
};

export const editTemplateMachine = Machine(
	{
		id: 'editTemplate',
		context: {
			templateName: '',
			exercises: []
		},
		initial: 'editing',
		states: {
			editing: {
				on: {
					NAME_INPUT: {
						actions: ['updateTemplateName']
					},
					ADD_EXERCISE: 'addingexercise',
					ADD_SET: 'addingset'
				}
			},
			addingexercise: {
				on: {
					SAVE: {
						target: 'editing',
						actions: ['addExercise']
					},
					CANCEL: 'editing'
				}
			},
			addingset: {
				on: {
					CANCEL: 'editing'
				}
			}
		}
	},
	{
		actions
	}
);
