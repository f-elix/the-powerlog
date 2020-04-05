import { Machine, assign, spawn, send } from 'xstate';
import { editTemplateExerciseMachine } from './editTemplateExerciseMachine';
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
				data: context.template,
			},
		};
		try {
			const token = getToken();
			const data = await getData(query, queryName, token);
			return data;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
};

const actions = {
	updateTemplateName: assign({
		template: (context, event) => {
			const updatedTemplate = context.template;
			updatedTemplate.name = event.params.value;
			return updatedTemplate;
		},
	}),
	addExercise: assign({
		template: (context, event) => {
			const { exercise } = event.params;
			if (!exercise._id) {
				exercise._id = ObjectID();
			}
			const newExercise = {
				_id: ObjectID(),
				movements: [
					{
						exercise,
						executions: [],
					},
				],
			};
			const updatedTemplate = context.template;
			updatedTemplate.exercises = [...context.template.exercises, newExercise];
			return updatedTemplate;
		},
	}),
	updateTemplateExercise: assign({
		template: (context, event) => {
			const updatedExerciseIndex = context.template.exercises.findIndex((e) => e._id === event.exercise._id);
			const updatedExercises = context.template.exercises;
			updatedExercises[updatedExerciseIndex] = event.exercise;
			const updatedTemplate = context.template;
			updatedTemplate.exercises = updatedExercises;
			return updatedTemplate;
		},
	}),
	deleteExercise: assign({
		template: (context, event) => {
			const { exerciseId } = event.params;
			const updatedExercises = context.template.exercises.filter((ex) => ex._id !== exerciseId);
			const updatedTemplate = context.template;
			updatedTemplate.exercises = updatedExercises;
			return updatedTemplate;
		},
	}),
	updateNameError: assign({
		nameError: 'Name is required',
	}),
	clearNameError: assign({
		nameError: '',
	}),
};

const guards = {
	isNameEmpty: (context, _) => context.template.name.length === 0,
};

export const editTemplateMachine = Machine(
	{
		id: 'editTemplate',
		context: {
			template: {
				name: '',
				exercises: [],
			},
			editedExercise: null,
			nameError: '',
		},
		initial: 'editing',
		states: {
			editing: {
				id: 'editing',
				initial: 'normal',
				states: {
					normal: {},
					error: {
						entry: ['updateNameError'],
						exit: ['clearNameError'],
					},
				},
				on: {
					NAME_INPUT: {
						actions: ['updateTemplateName'],
					},
					ADD_EXERCISE: 'exercise.adding',
					EDIT_EXERCISE: 'exercise.editing',
					ADD_EXECUTION: 'addingexecution',
					DELETE_EXERCISE: {
						actions: ['deleteExercise'],
					},
					SAVE_TEMPLATE: [
						{
							cond: 'isNameEmpty',
							target: 'editing.error',
						},
						{
							target: 'savingtemplate',
						},
					],
				},
			},
			exercise: {
				initial: 'adding',
				states: {
					adding: {
						on: {
							SAVE_EXERCISE: {
								target: '#editing',
								actions: ['addExercise'],
							},
						},
					},
					editing: {
						entry: assign({
							editedExercise: (_, event) =>
								spawn(editTemplateExerciseMachine(event.params.exercise, event.params.movement)),
						}),
						on: {
							SAVE_EXERCISE: {
								actions: send((_, event) => event, {
									to: (context) => context.editedExercise,
								}),
							},
							DONE: {
								target: '#editing',
								actions: ['updateTemplateExercise'],
							},
						},
						exit: assign({
							editedExercise: null,
						}),
					},
				},
				on: {
					CANCEL: 'editing',
				},
			},
			addingexecution: {
				entry: assign({
					editedExercise: (_, event) =>
						spawn(editTemplateExerciseMachine(event.params.exercise, event.params.movement)),
				}),
				on: {
					DONE: {
						target: 'editing',
						actions: ['updateTemplateExercise'],
					},
					CANCEL: 'editing',
				},
				exit: assign({
					editedExercise: null,
				}),
			},
			savingtemplate: {
				invoke: {
					src: 'saveTemplate',
					onDone: {
						target: 'done',
					},
					onError: {
						target: 'editing',
					},
				},
			},
			done: {
				type: 'final',
				data: {
					template: (context, _) => context.template,
				},
			},
		},
	},
	{
		actions,
		services,
		guards,
	}
);
