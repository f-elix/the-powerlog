import type { APIGatewayEvent } from 'aws-lambda';
import type { Exercise } from 'types';
import { gqlQuery } from './utils/gql-query';

export const handler: (
	event: APIGatewayEvent,
	context: any
) => Promise<{ statusCode: number; exercise: Exercise }> = async (event, context) => {
	const { user } = context.clientContext;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	const { exerciseId, exerciseName } = JSON.parse(event.body);

	return gqlQuery({
		query: `
		mutation updateExerciseName($exerciseId: Int!, $exerciseName: String!) {
			update_exercises_by_pk(pk_columns: {id: $exerciseId}, _set: {name: $exerciseName}) {
			  name
			}
		  }
		`,
		variables: {
			exerciseId,
			exerciseName
		}
	});
};
