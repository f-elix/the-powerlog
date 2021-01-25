import type { APIGatewayEvent } from 'aws-lambda';
import { gqlQuery } from './utils/gql-query';

export const handler: (event: APIGatewayEvent) => Promise<{ statusCode: number }> = async (
	event
) => {
	const { user } = JSON.parse(event.body || '{}');

	if (!user) {
		return {
			statusCode: 403
		};
	}

	try {
		const res = await gqlQuery({
			query: `
				mutation ($id: String!, $name: String!, $email: String!) {
					insert_users(objects: {id: $id, name: $name, email: $email}) {
					affected_rows
					}
				}
			`,
			variables: {
				id: user.id,
				email: user.email,
				name: user.user_metadata.full_name
			}
		});
		/* eslint-disable-next-line no-console */
		console.log(res);
		return {
			statusCode: 200
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 400
		};
	}
};
