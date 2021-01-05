import type { SetType, TimeUnit, LoadUnit } from 'src/utils';

export interface User {
	id: string;
	name?: string;
	email?: string;
	exercises?: Exercise[];
}

export interface Session {
	id: number;
	userId: string;
	title: string;
	date: string;
	exercises?: ExerciseInstance[];
	bodyweight?: {
		amount?: number;
		unit?: string;
	};
	user?: User;
}

export interface Exercise {
	id?: number;
	userId: string;
	name: string;
}

export interface ExerciseInstance {
	id?: number;
	sessionId: number;
	exercise?: Exercise;
	superset?: string;
	executions: Execution[];
}

export interface Execution {
	id: number;
	sets?: number;
	reps?: number;
	setType: SetType;
	load: {
		amount?: number;
		unit: LoadUnit;
		bodyweight?: boolean;
	};
	duration: {
		amount?: number;
		unit: TimeUnit;
	};
}
