import type { APIGatewayEvent } from 'aws-lambda';
import type { Session } from 'types';
import type { TQuery } from './utils/gql-query';
import { gqlQuery } from './utils/gql-query';

interface Value {
	name?: string;
	daysAgo?: number;
	weeksAgo?: number;
	date?: string;
	from?: string;
	to?: string;
}

interface FilterTypeQueries {
	[key: string]: TQuery;
}

const msInDay = 86400000;
const msInWeek = msInDay * 7;

export const handler: (
	event: APIGatewayEvent,
	context: any
) => Promise<{ statusCode: number; sessions: Session[] | [] }> = async (event, context) => {
	const { user } = context.clientContext;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	const {
		filterType,
		value
	}: { filterType: string; value: Record<string, string | number> } = JSON.parse(
		event.body || '{}'
	);

	const { name, daysAgo, weeksAgo, date, from, to }: Value = value;
	const numDaysAgo = daysAgo || 0;
	const numWeeksAgo = weeksAgo || 0;

	const types: FilterTypeQueries = {
		name: {
			query: `
				query getSessionsByName($userId: String!, $name: String!) {
					sessions(where: {userId: {_eq: $userId}, title: {_ilike: $name}}, order_by: {date: desc}) {
						id
						title
						date
					}
				}
			`,
			variables: {
				name: `%${name}%`,
				userId: user.sub
			}
		},
		daysAgo: {
			query: `
				query getSessionsByDate($userId: String!, $date: timestamptz!) {
					sessions(where: {userId: {_eq: $userId}, date: {_eq: $date}}, order_by: {date: desc})  {
						id
						title
						date
					}
				}
			`,
			variables: {
				date: new Date(Date.now() - numDaysAgo * msInDay).toISOString(),
				userId: user.sub
			}
		},
		weeksAgo: {
			query: `
				query getSessionsByDate($userId: String!, $date: timestamptz!) {
					sessions(where: {userId: {_eq: $userId}, date: {_eq: $date}}, order_by: {date: desc})  {
						id
						title
						date
					}
				}
			`,
			variables: {
				date: new Date(Date.now() - numWeeksAgo * msInWeek).toISOString(),
				userId: user.sub
			}
		},
		date: {
			query: `
				query getSessionsByDate($userId: String!, $date: timestamptz!) {
					sessions(where: {userId: {_eq: $userId}, date: {_eq: $date}}, order_by: {date: desc})  {
						id
						title
						date
					}
				}
			`,
			variables: {
				date: date || '',
				userId: user.sub
			}
		},
		period: {
			query: `
				query getSessionsByPeriod($userId: String!, $from: timestamptz!, $to: timestamptz!) {
					sessions(where: {userId: {_eq: $userId}, date: {_gte: $from, _lte:$to}}, order_by: {date: desc}) {
						id
						title
						date
					}
			  	}
			`,
			variables: {
				from: from || '',
				to: to || '',
				userId: user.sub
			}
		}
	};

	return gqlQuery(types[filterType]);
};
