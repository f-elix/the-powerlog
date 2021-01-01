import type { APIGatewayEvent } from 'aws-lambda';
import { faunaFetch } from './utils/fauna';

interface TResponseData {
	statusCode: number;
	body?: string;
}

export const handler: (event: APIGatewayEvent, context: any) => Promise<TResponseData> = async (
	event,
	context
) => {
	const body = JSON.parse(event.body || '{}');
	const user = context.clientContext?.user;
	const cursor = body.cursor ? `"${body.cursor}"` : null;
	const size = 2;

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
			  sessions(_size: ${size}, _cursor: ${cursor}) {
				data {
				  _id
				  name
				  date
				}
				after
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
