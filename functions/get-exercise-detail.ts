import type { APIGatewayEvent } from 'aws-lambda';
import type { Exercise } from 'types';
import { gqlQuery } from './utils/gql-query';

export const handler: (
	event: APIGatewayEvent,
	context: any
) => Promise<{ statusCode: number; exercise: Exercise[] }> = async (event, context) => {
	const { user } = context.clientContext;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	const { exerciseId } = JSON.parse(event.body);

	return gqlQuery({
		query: `
		query getExerciseDetail($exerciseId: Int!) {
			exercises_by_pk(id: $exerciseId) {
			  id
			  name
			  exerciseInstances(order_by: {performance: {session: {date: desc}}}) {
				executions
				performance {
				  session {
					date
				  }
				}
			  }
			}
		  }
		`,
		variables: {
			exerciseId
		}
	});
};
