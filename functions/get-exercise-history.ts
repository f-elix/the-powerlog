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

	const { exerciseId, date } = JSON.parse(event.body || '{}');

	return gqlQuery({
		query: `
		query getExeciseHistory($id: Int!, $date: timestamptz!) {
			sessions(limit: 1, where: {performances: {exerciseInstances: {exerciseId: {_eq: $id}}}, date: {_lt: $date}}) {
			  date
			  performances(where: {exerciseInstances: {exerciseId: {_eq: $id}}}) {
				exerciseInstances(where: {exerciseId: {_eq: $id}}) {
				  executions
				  exercise {
					name
					id
				  }
				}
			  }
			}
		  }
		`,
		variables: {
			id: exerciseId,
			date
		}
	});
};
