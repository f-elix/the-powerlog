import type { APIGatewayEvent } from 'aws-lambda';
import { faunaFetch } from './utils/fauna';

export const handler: (event: APIGatewayEvent) => Promise<{ statusCode: number }> = async (
	event
) => {
	const { user } = JSON.parse(event.body || '{}');

	if (!user) {
		return {
			statusCode: 404
		};
	}

	await faunaFetch({
		query: `
		  mutation ($id: ID!) {
			createUser(data: { netlifyId: $id }) {
				_id
				netlifyId
			}
		  }
		`,
		variables: {
			id: user.id
		}
	});

	return {
		statusCode: 200
	};
};
