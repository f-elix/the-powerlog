import type { APIGatewayEvent } from 'aws-lambda';
import { faunaFetch } from './utils/fauna';

export const handler: (event: APIGatewayEvent) => Promise<{ statusCode: number }> = async (
	event
) => {
	const { user } = JSON.parse(event.body || '{}');
	console.log(user);

	if (!user) {
		return {
			statusCode: 404
		};
	}

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
			name: user.name
		}
	});

	return {
		statusCode: 200
	};
};
