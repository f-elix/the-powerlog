import type { Session } from 'types';
import type { ExerciseEvent } from 'src/machines/exercise';
import { createMachine, assign, spawn, SpawnedActorRef } from 'xstate';
import { assertEventType } from 'src/utils';
import { exerciseMachine } from 'src/machines/exercise';

interface EditContext {
	session: Session;
	exerciseActors?: SpawnedActorRef<ExerciseEvent>[];
}

type EditEvent =
	| { type: 'CREATE'; data: { userId: string } }
	| { type: 'TITLE_INPUT'; data: { value: string } }
	| { type: 'DATE_INPUT'; data: { value: string } }
	| { type: 'NEW_EXERCISE' };

type EditState =
	| {
			value: 'idle';
			context: EditContext & {
				userId: undefined;
			};
	  }
	| {
			value: 'editing';
			context: EditContext;
	  };

export const editMachine = createMachine<EditContext, EditEvent, EditState>(
	{
		id: 'edit',
		initial: 'idle',
		context: {
			session: {
				userId: undefined,
				title: '',
				date: new Date().toLocaleDateString('en-CA')
			},
			exerciseActors: undefined
		},
		states: {
			idle: {
				on: {
					CREATE: {
						target: 'editing',
						actions: ['updateUserId']
					}
				}
			},
			editing: {
				on: {
					TITLE_INPUT: {
						actions: ['updateTitle']
					},
					DATE_INPUT: {
						actions: ['updateDate']
					},
					NEW_EXERCISE: {
						actions: ['spawnExercise']
					}
				}
			}
		}
	},
	{
		actions: {
			updateUserId: assign({
				session: (context, event) => {
					assertEventType(event, 'CREATE');
					const { session } = context;
					return {
						...session,
						userId: event.data.userId
					};
				}
			}),
			updateTitle: assign({
				session: (context, event) => {
					assertEventType(event, 'TITLE_INPUT');
					const { session } = context;
					return {
						...session,
						title: event.data.value
					};
				}
			}),
			updateDate: assign({
				session: (context, event) => {
					assertEventType(event, 'TITLE_INPUT');
					const { session } = context;
					return {
						...session,
						date: event.data.value
					};
				}
			}),
			spawnExercise: assign({
				exerciseActors: (context, event) => {
					assertEventType(event, 'NEW_EXERCISE');
					const exercises = context.exerciseActors || [];
					const newExercise = spawn(exerciseMachine);
					return [...exercises, newExercise];
				}
			})
		}
	}
);
