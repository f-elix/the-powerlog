import netlifyIdentity from 'netlify-identity-widget';
import type { EventObject } from 'xstate';
import type { Session, Execution, ExerciseInstance, Performance } from 'types';
import type { AuthUser } from './router';

export const getToken = async (): Promise<string | null> => {
	const user: AuthUser | null = netlifyIdentity.currentUser() as AuthUser;
	if (!user || !user.token) {
		return null;
	}
	const { token } = user;
	const expiresAt = token.expires_at;
	const isExpired = Date.now() > expiresAt;
	return user.jwt(isExpired);
};

export const getLocalDate: (dateInput: string) => Date = (dateInput: string) => {
	const date = new Date(dateInput);
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * -60000);
	return localDate;
};

export const formatDate: (dateInput: Date) => string = (dateInput) => {
	const date = new Date(dateInput);
	const month = date.getMonth() + 1;
	const monthValue = month > 9 ? month : `0${month}`;
	const day = date.getDate();
	const dayValue = day > 9 ? day : `0${day}`;
	return `${date.getFullYear()}-${monthValue}-${dayValue}`;
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

export const isTouchDevice: () => boolean = () => window.matchMedia('(pointer: coarse)').matches;

export enum SetType {
	reps = 'reps',
	time = 'time'
}

export enum TimeUnit {
	sec = 'sec',
	min = 'min'
}

export enum LoadUnit {
	lbs = 'lbs',
	kg = 'kg'
}

export const generateId = (): number => Math.floor(Math.random() * Date.now());

export const createExecution: () => Execution = () => ({
	id: generateId(),
	setType: SetType.reps,
	duration: {
		unit: TimeUnit.sec
	},
	load: {
		unit: LoadUnit.lbs
	}
});

export const createExerciseInstance = (performanceId: number): ExerciseInstance => ({
	id: generateId(),
	performanceId,
	executions: [createExecution()]
});

export const createPerformance = (sessionId: number): Performance => {
	const id = generateId();
	return {
		id,
		sessionId,
		exerciseInstances: [createExerciseInstance(id)]
	};
};

export const updateObjectKey = <TObj extends Record<string, any>>(
	obj: TObj,
	key: string | string[],
	value: any
): TObj => {
	const updatedObj = obj;
	if (typeof key === 'string') {
		return updateObjectKey(updatedObj, key.split('.'), value);
	}
	if (key.length === 1 && value !== undefined) {
		return {
			...updatedObj,
			[key[0]]: value
		};
	}
	return {
		...updatedObj,
		[key[0]]: updateObjectKey(updatedObj[key[0]], key.slice(1), value)
	};
};

export const getElMid = (el: HTMLElement): number => {
	if (!el) {
		return 0;
	}
	const rect = el.getBoundingClientRect();
	const { height, top } = rect;
	return top + height / 2;
};

export const getPosition = (element: HTMLElement): { x: number; y: number } => {
	let xPos = 0;
	let yPos = 0;

	let el: HTMLElement | null = element;

	while (el) {
		if (el.tagName === 'BODY') {
			// deal with browser quirks with body/window/document and page scroll
			const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
			const yScroll = el.scrollTop || document.documentElement.scrollTop;

			xPos += el.offsetLeft - xScroll + el.clientLeft;
			yPos += el.offsetTop - yScroll + el.clientTop;
		} else {
			// for all other non-BODY elements
			xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
			yPos += el.offsetTop - el.scrollTop + el.clientTop;
		}

		el = el.offsetParent as HTMLElement;
	}
	return {
		x: xPos,
		y: yPos
	};
};

export const getElOffsetMid = (el: HTMLElement): number => {
	if (!el) {
		return 0;
	}
	const top = getPosition(el).y;
	return top + el.offsetHeight / 2;
};

export const getElOffsetTop = (el: HTMLElement): number => {
	if (!el) {
		return 0;
	}
	const top = getPosition(el).y;
	return top;
};

export const getElOffsetBottom = (el: HTMLElement): number => {
	if (!el) {
		return 0;
	}
	const top = getPosition(el).y;
	return top + el.offsetHeight;
};

export const reorderArray = (array: any[], from: number, to: number): any[] => {
	const reorderedArray = array;
	reorderedArray.splice(to, 0, reorderedArray.splice(from, 1)[0]);
	return reorderedArray;
};

export const scrollIntoView = (node: HTMLElement): void => {
	node.scrollIntoView({
		block: 'end',
		behavior: 'smooth'
	});
};
