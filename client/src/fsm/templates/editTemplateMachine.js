import { Machine, assign, spawn } from 'xstate';
import { editExerciseMachine } from './editExerciseMachine';
import ObjectID from 'bson-objectid';

const actions = {
	updateTemplateName: assign({
		templateName: (_, event) => event.params.value
	}),
	addExercise: assign({
		exercises: (context, event) => {
			const exercise = event.params.value;
			if (!exercise._id) {
				exercise._id = ObjectID();
			}
			const newExercise = {
				_id: ObjectID(),
				movements: [
					{
						exercise,
						executions: []
					}
				]
			};
			return [...context.exercises, newExercise];
		}
	}),
	updateExercise: assign({
		exercises: (context, event) => {
			const updatedExerciseIndex = context.exercises.findIndex(e => e._id === event.exercise._id);
			const updatedExercises = context.exercises;
			updatedExercises[updatedExerciseIndex] = event.exercise;
			return updatedExercises;
		}
	})
};

export const editTemplateMachine = Machine(
	{
		id: 'editTemplate',
		context: {
			templateName: '',
			exercises: [],
			editedExercise: null
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
				entry: assign({
					editedExercise: (_, event) =>
						spawn(editExerciseMachine(event.params.exercise, event.params.movement))
				}),
				on: {
					DONE: {
						target: 'editing',
						actions: ['updateExercise']
					},
					CANCEL: 'editing'
				},
				exit: assign({
					editedExercise: null
				})
			}
		}
	},
	{
		actions
	}
);
