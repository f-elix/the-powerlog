import fetch, { RequestInfo } from 'node-fetch';

export interface TQuery {
	query: string;
	variables: Record<string, string | number>;
}

export const gqlQuery: (query: TQuery) => Promise<any> = async ({ query, variables }) => {
	try {
		const res = await fetch(<RequestInfo>process.env.HASURA_ENDPOINT, {
			method: 'POST',
			headers: {
				'x-hasura-admin-secret': <string>process.env.HASURA_GRAPHQL_ADMIN_SECRET
			},
			body: JSON.stringify({
				query,
				variables
			})
		});

		const { errors, data } = await res.json();

		if (errors) {
			console.error(errors);
			return {
				statusCode: 500,
				body: JSON.stringify(errors)
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify(data)
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};
