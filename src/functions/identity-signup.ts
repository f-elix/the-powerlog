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

	const name = user.user_metadata?.full_name;

	await faunaFetch({
		query: `
		  mutation ($id: ID!, $name: String!) {
			createUser(data: { netlifyId: $id, name: $name }) {
				_id
				netlifyId
				name
			}
		  }
		`,
		variables: {
			id: user.id,
			name: name || 'Anonymous'
		}
	});

	return {
		statusCode: 200
	};
};
