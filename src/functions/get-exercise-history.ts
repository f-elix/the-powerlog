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

	const { exerciseId } = JSON.parse(event.body || '{}');

	return gqlQuery({
		query: `
			query getExeciseHistory($id: Int!) {
				exercises_by_pk(id:$id) {
					exercise_instances(limit: 1, order_by: {session: {date: desc}}) {
						executions
					}
				}
			}
		`,
		variables: {
			id: exerciseId
		}
	});
};
