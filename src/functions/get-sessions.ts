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
				query getSessions($id: String!)	{
					sessions(where: {user_id: {_eq: $id}}) {
						id
						date
						title
					}
				}
			`,
		variables: {
			id: user.sub
		}
	});
};
