import fetch from 'node-fetch';

interface TQuery {
	query: string;
	variables: Record<string, string>;
}

export const faunaFetch: (query: TQuery) => Promise<unknown> = async ({ query, variables }) => {
	try {
		const res = await fetch('https://graphql.fauna.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.FAUNA_SERVER_KEY}`
			},
			body: JSON.stringify({
				query,
				variables
			})
		});
		return await res.json();
	} catch (err) {
		console.warn(err);
		throw err;
	}
};
