import type { EventObject } from 'xstate';
import type { Session } from 'types';

export const getLocalDate: (dateInput: string) => Date = (dateInput: string) => {
	const date = new Date(dateInput);
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * -60000);
	return localDate;
};

export const getNumberOfWeek: (dateInput: string) => number = (dateInput) => {
	const date = new Date(dateInput);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date.valueOf() - firstDayOfYear.valueOf()) / 86400000;
	// Modified to start the week on Monday
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7);
};

export const isFirstOfWeek: (sessions: Session[], sessionDate: string, index: number) => boolean = (
	sessions,
	sessionDate,
	i
) => {
	// Next session in the array is the preceding one in time because sessions are ordered by desc. date
	const precedingSession = sessions[i + 1];
	if (!precedingSession) {
		return true;
	}
	const sessionWeek = getNumberOfWeek(sessionDate);
	const precedingSessionWeek = getNumberOfWeek(precedingSession.date);
	// If both sessions are in the same week
	if (sessionWeek === precedingSessionWeek) {
		return false;
	}
	return true;
};

export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function assertEventType<TE extends EventObject, TType extends TE['type']>(
	event: TE,
	eventType: TType
): asserts event is TE & { type: TType } {
	if (event.type !== eventType) {
		throw new Error(`Invalid event: expected "${eventType}", got "${event.type}"`);
	}
}
