export function currentWeekDates() {
	let date = new Date();
	const monday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 0));
	date = new Date();
	const sunday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? 0 : 6));
	return {
		currentMonday: new Date(monday).toISOString().split('T')[0],
		currentSunday: new Date(sunday).toISOString().split('T')[0]
	};
}

export function lastWeekDates() {
	let date = new Date();
	const monday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 0) - 7);
	date = new Date();
	const sunday = date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? 0 : 6) - 7);
	return {
		lastMonday: new Date(monday).toISOString().split('T')[0],
		lastSunday: new Date(sunday).toISOString().split('T')[0]
	};
}

export function getToken() {
	const token = localStorage.getItem(process.env.APP_TOKEN);
	if (!token) {
		const error = new Error('Not authenticated');
		console.warn(error);
		throw error;
	}
	return token;
}

export async function getData(query, queryName, token = null) {
	const headers = {
		'content-type': 'application/json'
	};
	if (token) {
		headers.authorization = token;
	}
	try {
		const res = await fetch(process.env.APP_API, {
			method: 'POST',
			headers,
			body: JSON.stringify(query)
		});
		const data = await res.json();
		if (data.errors) {
			const error = new Error();
			error.message = data.errors[0].message;
			error.statusCode = data.errors[0].extensions.exception.statusCode;
			throw error;
		}
		return data.data[queryName];
	} catch (err) {
		console.error(err);
		throw err;
	}
}
