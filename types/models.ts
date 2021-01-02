export interface User {
	id: string;
	name?: string;
	email?: string;
}

export interface Session {
	id: number;
	userId: string;
	title: string;
	date: string;
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
	id: number;
	sessionId: number;
	exerciseId: number;
	superset: string | null;
	executions?: {
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
	}[];
}
