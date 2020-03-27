import { Machine, assign } from 'xstate';
import { editExerciseMachine } from './editExerciseMachine';
import ObjectID from 'bson-objectid';

const actions = {
	updateTemplateName: assign({
		templateName: (_, event) => event.params.value
	}),
	addExercise: assign({
		exercises: (context, event) => {
			const exercise = event.params.value;
			if (!exercise) {
				return context.exercises;
			}
			const newExercise = {
				_id: ObjectID(),
				movements: [
					{
						exercise: exercise,
						executions: []
					}
				]
			};
			return [...context.exercises, newExercise];
		}
	}),
	addExecution: assign({})
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
					ADD_EXECUTION: 'addingexecution'
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
			addingexecution: {
				on: {
					SAVE: {
						target: 'editing',
						actions: ['addExecution']
					},
					CANCEL: 'editing'
				}
			}
		}
	},
	{
		actions
	}
);
