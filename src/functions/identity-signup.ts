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

	const res = await faunaFetch({
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

	/* eslint-disable-next-line no-console */
	console.log(res);

	return {
		statusCode: 200
	};
};
