import type { APIGatewayEvent } from 'aws-lambda';
import type { Session } from 'types';
import { gqlQuery } from './utils/gql-query';

export const handler: (
	event: APIGatewayEvent,
	context: any
) => Promise<{ statusCode: number; sessions: Session[] | [] }> = async (event, context) => {
	const { user } = context.clientContext;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	return gqlQuery({
		query: `
			query getExercises($userId: String!) {
				exercises(where: {userId: {_eq: $userId}}) {
					id
					name
					userId
				}
			}
		`,
		variables: {
			userId: user.sub
		}
	});
};
