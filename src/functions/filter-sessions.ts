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
				query getSessionsByName($name: String!) {
					sessions(where: {title: {_ilike: $name}}, order_by: {date: desc}) {
						id
						title
						date
					}
				}
			`,
			variables: {
				name: `%${name}%`
			}
		},
		daysAgo: {
			query: `
				query getSessionsByDate($date: timestamptz!) {
					sessions(where: {date: {_eq: $date}}, order_by: {date: desc})  {
						id
						title
						date
					}
				}
			`,
			variables: {
				date: new Date(Date.now() - numDaysAgo * msInDay).toISOString()
			}
		},
		weeksAgo: {
			query: `
				query getSessionsByDate($date: timestamptz!) {
					sessions(where: {date: {_eq: $date}}, order_by: {date: desc})  {
						id
						title
						date
					}
				}
			`,
			variables: {
				date: new Date(Date.now() - numWeeksAgo * msInWeek).toISOString()
			}
		},
		date: {
			query: `
				query getSessionsByDate($date: timestamptz!) {
					sessions(where: {date: {_eq: $date}}, order_by: {date: desc})  {
						id
						title
						date
					}
				}
			`,
			variables: {
				date: date || ''
			}
		},
		period: {
			query: `
				query getSessionsByPeriod($from: timestamptz!, $to: timestamptz!) {
					sessions(where: {date: {_gte: $from, _lte:$to}}, order_by: {date: desc}) {
						id
						title
						date
					}
			  	}
			`,
			variables: {
				from: from || '',
				to: to || ''
			}
		}
	};

	return gqlQuery(types[filterType]);
};
