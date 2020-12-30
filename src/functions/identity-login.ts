import type { APIGatewayEvent } from 'aws-lambda';

export const handler: (event: APIGatewayEvent) => Promise<{ statusCode: number }> = async (
	event
) => {
	const { user, payload } = JSON.parse(event.body || '{}');

	console.log({user, payload});

	return {
		statusCode: 200
	};
};
