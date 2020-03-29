import { Machine, assign, spawn } from 'xstate';
import { editExerciseMachine } from './editExerciseMachine';
import { getData, getToken } from '@/assets/js/utils.js';
import { goto } from '@sapper/app';
import ObjectID from 'bson-objectid';

const services = {
	saveTemplate: async (context, _) => {
		const queryName = 'saveTemplate';
		const query = {
			query: `
				mutation saveTemplate($data: TemplateInput!) {
					saveTemplate(templateData: $data) {
						name
					}
				}
			`,
			variables: {
				data: context.template
			}
		};
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
};

const actions = {
	updateTemplateName: assign({
		template: (context, event) => {
			const updatedTemplate = context.template;
			updatedTemplate.name = event.params.value;
			return updatedTemplate;
		}
	}),
	addExercise: assign({
		template: (context, event) => {
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
			const updatedTemplate = context.template;
			updatedTemplate.exercises = [...context.template.exercises, newExercise];
			return updatedTemplate;
		}
	}),
	updateExercise: assign({
		template: (context, event) => {
			const updatedExerciseIndex = context.template.exercises.findIndex(e => e._id === event.exercise._id);
			const updatedExercises = context.template.exercises;
			updatedExercises[updatedExerciseIndex] = event.exercise;
			const updatedTemplate = context.template;
			updatedTemplate.exercises = updatedExercises;
			return updatedTemplate;
		}
	}),
	routeTemplates: () => {
		goto('/templates');
	}
};

export const editTemplateMachine = Machine(
	{
		id: 'editTemplate',
		context: {
			template: {
				name: '',
				exercises: []
			},
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
					ADD_EXECUTION: 'addingexecution',
					SAVE_TEMPLATE: 'savingtemplate'
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
			},
			savingtemplate: {
				invoke: {
					src: 'saveTemplate',
					onDone: {
						target: 'done'
					},
					onError: {
						target: 'editing'
					}
				}
			},
			done: {
				entry: 'routeTemplates',
				type: 'final'
			}
		}
	},
	{
		actions,
		services
	}
);
