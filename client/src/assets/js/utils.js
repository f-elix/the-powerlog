export function currentWeekDates() {
	let date = new Date();
	const monday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 0));
	date = new Date();
	const sunday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? 0 : 6));
	return {
		monday: new Date(monday).toISOString().split('T')[0],
		sunday: new Date(sunday).toISOString().split('T')[0]
	};
}

export const currentWeekQuery = {
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
			fromDate: currentWeekDates().monday,
			toDate: currentWeekDates().sunday
		}
	},
	queryName: 'getSessionsFromTo'
};

export function lastWeekDates() {
	let date = new Date();
	const monday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 0) - 7);
	date = new Date();
	const sunday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? 0 : 6) - 7);
	return {
		monday: new Date(monday).toISOString().split('T')[0],
		sunday: new Date(sunday).toISOString().split('T')[0]
	};
}

export const lastWeekQuery = {
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
			fromDate: lastWeekDates().monday,
			toDate: lastWeekDates().sunday
		}
	}
};
