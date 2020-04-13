export function sessionPeriodQuery(from, to) {
	return {
		query: {
			query: `
            query getSessionsFromTo($fromDate: Date!, $toDate: Date!) {
                getSessionsFromTo(fromDate: $fromDate, toDate: $toDate) {
                    _id
                    name
                    sessionDate
                }
            }
        `,
			variables: {
				fromDate: from,
				toDate: to
			}
		},
		queryName: 'getSessionsFromTo'
	};
}

export function sessionRangeQuery(from, to) {
	return {
		query: {
			query: `
				query getSessionRange($from: Int!, $to: Int!) {
					getSessionRange(from: $from, to: $to){
					sessionDate
					name
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

export function sessionNameQuery(name) {
	return {
		query: {
			query: `
                query searchByTitle($title: String!) {
                    getSessionsByTitle(name: $title) {
                        _id
                        name
                        sessionDate
                    }
                }
            `,
			variables: {
				name
			}
		},
		queryName: 'getSessionsByTitle'
	};
}

export function sessionDateQuery(date) {
	return {
		query: {
			query: `
                query searchByDate($date: Date!) {
                    getSessionsByDate(sessionDate: $date) {
                    _id
                    name
                    sessionDate
                    }
                }
            `,
			variables: {
				date
			}
		},
		queryName: 'getSessionsByDate'
	};
}
