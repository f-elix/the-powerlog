export const currentWeekQuery = (monday, sunday) => {
    return {
        query: {
            query: `
            query getCurrentWeek($fromDate: Date!, $toDate: Date!) {
                getSessionsFromTo(fromDate: $fromDate, toDate: $toDate) {
                    _id
                    title
                    sessionDate
                }
            }
        `,
            variables: {
                fromDate: monday,
                toDate: sunday
            }
        },
        queryName: 'getSessionsFromTo'
    }
};

export const lastWeekQuery = (monday, sunday) => {
    return {
        query: {
            query: `
            query getLastWeek($fromDate: Date!, $toDate: Date!) {
                getSessionsFromTo(fromDate: $fromDate, toDate: $toDate) {
                    _id
                    title
                    sessionDate
                }
            }
        `,
            variables: {
                fromDate: monday,
                toDate: sunday
            }
        },
        queryName: 'getSessionsFromTo'
    }
};

export function sessionRangeQuery(from, to) {
    return {
        query: {
            query: `
				query getSessionRange($from: Int!, $to: Int!) {
					getSessionRange(from: $from, to: $to){
					sessionDate
					title
					_id
					}
				}
			`,
            variables: {
                from,
                to
            }
        },
        queryName: 'getSessionRange'
    };
}