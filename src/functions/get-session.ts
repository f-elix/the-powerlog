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

	const { sessionId } = JSON.parse(event.body || '{}');

	if (!sessionId) {
		return {
			statusCode: 400
		};
	}

	return gqlQuery({
		query: `
			query getSession($id: Int!) {
				sessions_by_pk(id: $id) {
					id
					date
					title
					exercises {
						id
						sessionId
						executions
						exercise {
							id
							name
						}
						superset
					}
				}
			}
			`,
		variables: {
			id: sessionId
		}
	});
};
