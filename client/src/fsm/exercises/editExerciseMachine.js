import { Machine, assign, sendParent } from 'xstate';
import { getData, getToken } from '@/js/utils.js';

const services = {
	saveExercise: async (context, _) => {
		const queryName = 'saveExercise';
		const query = {
			query: `
                mutation saveExercise($data: ExerciseInput!) {
                    saveExercise(exerciseData: $data ) {
                        name
                        _id
                    }
                }
            `,
			variables: {
				data: context.exercise
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
	updateExercise: assign({
		exercise: (context, _) => {
			const updatedExercise = context.exercise;
			updatedExercise.name = context.name;
			return updatedExercise;
		}
	}),
	updateName: assign({
		name: (_, event) => event.params.name
	})
};

const guards = {
	isInputEmpty: (context, _) => context.name.trim().length === 0
};

export const editExerciseMachine = exercise => {
	return Machine(
		{
			id: 'editExercise',
			context: {
				exercise,
				name: exercise.name
			},
			initial: 'editing',
			states: {
				editing: {
					on: {
						SAVE: [
							{
								cond: 'isInputEmpty',
								target: 'editing'
							},
							{
								target: 'saving',
								actions: ['updateExercise']
							}
						],
						DISCARD: 'success',
						INPUT: {
							actions: ['updateName']
						}
					}
				},
				saving: {
					invoke: {
						src: 'saveExercise',
						onDone: 'success',
						onError: 'editing'
					}
				},
				success: {
					entry: sendParent('DONE_EDITING'),
					type: 'final'
				}
			}
		},
		{
			services,
			actions,
			guards
		}
	);
};
