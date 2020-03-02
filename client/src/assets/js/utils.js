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
