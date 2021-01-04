export interface User {
	id: string;
	name?: string;
	email?: string;
}

export interface Session {
	id?: number;
	userId?: string;
	title: string;
	date: string;
	exercises?: ExerciseInstance[];
	bodyweight?: {
		amount?: number;
		unit?: string;
	};
}

export interface Exercise {
	id: number;
	userId: string;
	name: string;
}

export interface ExerciseInstance {
	id?: number;
	sessionId?: number;
	exerciseId?: number;
	exercise: Exercise;
	superset?: string;
	executions?: Execution[];
}

export interface Execution {
	sets?: number;
	reps?: number;
	load?: {
		amount?: number;
		unit?: string;
		bodyweight?: boolean;
	};
	duration?: {
		amount?: number;
		unit?: string;
	};
}
