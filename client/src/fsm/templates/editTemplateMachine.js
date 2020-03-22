import { Machine, assign } from 'xstate';
import { editExerciseMachine } from './editExerciseMachine';

const actions = {
	updateTemplateName: assign({
		templateName: (_, event) => event.params.value
	})
};

export const editTemplateMachine = Machine(
	{
		id: 'editTemplate',
		context: {
			templateName: ''
		},
		initial: 'editing',
		states: {
			editing: {
				on: {
					NAME_INPUT: {
						actions: ['updateTemplateName']
					},
					ADD_EXERCISE: {
						target: 'addingexercise'
					}
				}
			},
			addingexercise: {
				invoke: {
					id: 'addExercise',
					src: editExerciseMachine,
					onDone: {
						target: 'editing',
						actions: []
					}
				},
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
