import type { APIGatewayEvent } from 'aws-lambda';

export const handler: (event: APIGatewayEvent) => Promise<{ statusCode: number }> = async (
	event
) => {
	const { user } = JSON.parse(event.body || '{}');

	console.log('login', user);

	if (!user) {
		return {
			statusCode: 404
		};
	}

	return {
		statusCode: 200
	};
};
