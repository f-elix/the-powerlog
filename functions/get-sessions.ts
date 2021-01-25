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

	const { cursor, limit } = JSON.parse(event.body || '{}');

	return gqlQuery({
		query: `
				query getSessions($userId: String!, $dateCursor: timestamptz, $limit: Int!)	{
					sessions(where: {userId: {_eq: $userId}, date: {_lt: $dateCursor}}, order_by: {date: desc}, limit: $limit) {
						id
						date
						title
					}
				}
			`,
		variables: {
			userId: user.sub,
			dateCursor: cursor,
			limit
		}
	});
};
