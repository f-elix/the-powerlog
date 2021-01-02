import type { Session } from 'types';

export const getLocalDate: (dateInput: string) => Date = (dateInput: string) => {
	const date = new Date(dateInput);
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * -60000);
	return localDate;
};

export const isFirstOfWeek: (sessions: Session[], dateStr: string, index: number) => boolean = (
	sessions,
	sessionDateStr,
	i
) => {
	if (!sessions[i + 1]) {
		return false;
	}
	if (sessionDateStr === sessions[i + 1].date) {
		return false;
	}
	const sessionDate = getLocalDate(sessionDateStr);
	const precedingSessionDate = getLocalDate(sessions[i + 1].date);
	if (sessionDate.getMonth() !== precedingSessionDate.getMonth()) {
		return true;
	}
	if (Math.abs(sessionDate.getDate() - precedingSessionDate.getDate()) > 6) {
		return true;
	}
	const sessionDay = sessionDate.getDay();
	const precedingSessionDay = precedingSessionDate.getDay();
	if (precedingSessionDay === 0 || sessionDay === 1) {
		return true;
	}
	if (sessionDay !== 0 && sessionDay < precedingSessionDay) {
		return true;
	}
	return false;
};

export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
