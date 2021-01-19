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

	const { id } = JSON.parse(event.body || '{}');

	return gqlQuery({
		query: `
			mutation deleteSession($id: Int!) {
				delete_exercise_instances(where: {performance: {sessionId: {_eq: $id}}}) {
					affected_rows
				}
				delete_performances(where: {sessionId: {_eq: $id}}) {
					affected_rows
				}
				delete_sessions_by_pk(id: $id) {
					userId
				}
			}
		`,
		variables: {
			id
		}
	});
};
