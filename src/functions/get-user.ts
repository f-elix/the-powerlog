import type { APIGatewayEvent } from 'aws-lambda';
import { faunaFetch } from './utils/fauna';

interface TResponseData {
	statusCode: number;
	body?: string;
}

export const handler: (event: APIGatewayEvent, context: any) => Promise<TResponseData> = async (
	_,
	context
) => {
	const user = context.clientContext?.user;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	const res = await faunaFetch({
		query: `
		query($id: ID!) {
			getUserById(netlifyId: $id) {
			  _id
			  sessions {
				data {
				  _id
				  name
				  date
				}
			  }
			  exercises {
				data {
				  name
				}
			  }
			}
		  }
		`,
		variables: {
			id: user.sub
		}
	});

	const userData = res.data.getUserById;

	return {
		statusCode: 200,
		body: JSON.stringify(userData)
	};
};
