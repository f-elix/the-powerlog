export function sessionPeriodQuery(from, to) {
	return {
		query: {
			query: `
            query getSessionsFromTo($fromDate: Date!, $toDate: Date!) {
                getSessionsFromTo(fromDate: $fromDate, toDate: $toDate) {
                    _id
                    name
                    date
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
					date
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
                query searchByName($name: String!) {
                    getSessionsByName(name: $name) {
                        _id
                        name
                        date
                    }
                }
            `,
			variables: {
				name
			}
		},
		queryName: 'getSessionsByName'
	};
}

export function sessionDateQuery(date) {
	return {
		query: {
			query: `
                query searchByDate($date: Date!) {
                    getSessionsByDate(date: $date) {
                    _id
                    name
                    date
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
