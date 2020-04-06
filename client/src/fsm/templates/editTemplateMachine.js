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
	addTemplateExercise: assign({
		template: (context, event) => {
			const updatedTemplate = context.template;
			updatedTemplate.exercises = [...context.template.exercises, event.exercise];
			return updatedTemplate;
		},
	}),
	updateTemplateExercise: assign({
		template: (context, event) => {
			const updatedExerciseIndex = context.template.exercises.findIndex(e => e._id === event.exercise._id);
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
			const updatedExercises = context.template.exercises.filter(ex => ex._id !== exerciseId);
			const updatedTemplate = context.template;
			updatedTemplate.exercises = updatedExercises;
			return updatedTemplate;
		},
	}),
	deleteExecution: assign({
		template: (context, event) => {
			const { exercise, movement, execution } = event.params;
			const exerciseIndex = context.template.exercises.findIndex(e => e._id === exercise._id);
			const movementIndex = exercise.movements.findIndex(m => m._id === movement._id);
			const updatedExecutions = movement.executions.filter(e => e._id !== execution._id);
			const updatedTemplate = context.template;
			updatedTemplate.exercises[exerciseIndex].movements[movementIndex].executions = updatedExecutions;
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
					DELETE_EXERCISE: {
						actions: ['deleteExercise'],
					},
					ADD_EXECUTION: 'execution',
					EDIT_EXECUTION: 'execution',
					DELETE_EXECUTION: {
						actions: ['deleteExecution'],
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
						entry: assign({
							editedExercise: (_, event) => spawn(editTemplateExerciseMachine()),
						}),
						on: {
							DONE: {
								target: '#editing',
								actions: ['addTemplateExercise'],
							},
						},
					},
					editing: {
						entry: assign({
							editedExercise: (_, event) =>
								spawn(editTemplateExerciseMachine(event.params.exercise, event.params.movement)),
						}),
						on: {
							DONE: {
								target: '#editing',
								actions: ['updateTemplateExercise'],
							},
						},
					},
				},
				on: {
					SAVE_EXERCISE: {
						actions: send((_, event) => event, {
							to: context => context.editedExercise,
						}),
					},
					CANCEL: 'editing',
				},
				exit: assign({
					editedExercise: null,
				}),
			},
			execution: {
				entry: assign({
					editedExercise: (_, event) =>
						spawn(
							editTemplateExerciseMachine(
								event.params.exercise,
								event.params.movement,
								event.params.execution
							)
						),
				}),
				on: {
					SAVE_EXECUTION: {
						actions: send((_, event) => event, {
							to: context => context.editedExercise,
						}),
					},
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
