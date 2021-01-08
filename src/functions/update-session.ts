import type { APIGatewayEvent } from 'aws-lambda';
import type { ExerciseInstance, Session, ExerciseInstanceInput, ExerciseInput } from 'types';
import { gqlQuery } from './utils/gql-query';

export const handler: (
	event: APIGatewayEvent,
	context: any
) => Promise<{ statusCode: number; session?: Session }> = async (event, context) => {
	const { user } = context.clientContext;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	const { session } = JSON.parse(event.body || '{}');

	if (!session) {
		return {
			statusCode: 400
		};
	}

	const updatedSession = session;

	const instances: ExerciseInstanceInput[] = updatedSession.exercises.map(
		(instance: ExerciseInstance) => {
			if (instance.exercise?.id) {
				const updatedInstance = {
					...instance,
					exerciseId: instance.exercise.id
				};
				delete updatedInstance.exercise;
				return updatedInstance;
			}
			if (instance.exercise) {
				const exerciseInput: ExerciseInput = {
					data: {
						...instance.exercise
					}
				};
				const updatedInstance = {
					...instance,
					exercise: exerciseInput
				};
				return updatedInstance;
			}
			return instance;
		}
	);

	return gqlQuery({
		query: `
		mutation replaceInstances($sessionId: Int!, $instances: [exercise_instances_insert_input!]!, $session: sessions_pk_columns_input!, $date: timestamptz!, $title:String!) {
			delete_exercise_instances(where: {sessionId: {_eq: $sessionId}}) {
			  affected_rows
			}
			insert_exercise_instances(objects: $instances) {
			  affected_rows
			},
			update_sessions_by_pk(pk_columns: $session, _set:{date:$date, title:$title}) {
				id
				date
				title
			}
		  }
		`,
		variables: {
			sessionId: updatedSession.id,
			instances,
			session: {
				id: updatedSession.id
			},
			date: updatedSession.date,
			title: updatedSession.title
		}
	});
};