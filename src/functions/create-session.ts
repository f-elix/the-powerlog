import type { APIGatewayEvent } from 'aws-lambda';
import type { Session } from 'types';
import { gqlQuery } from './utils/gql-query';

export const handler: (
	event: APIGatewayEvent,
	context: any
) => Promise<{ statusCode: number; session: Partial<Session> }> = async (event, context) => {
	const { user } = context.clientContext;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	return gqlQuery({
		query: `
		mutation createSession($userId: String!, $title: String!) {
			insert_sessions_one(object: {title: $title, userId: $userId}) {
			  id
			  userId
			  title
			  date
			  performances {
				id
			  }
			  user {
				exercises {
				  id
				  name
				  userId
				}
			  }
			}
		  }
		`,
		variables: {
			userId: user.sub,
			title: ''
		}
	});
};
