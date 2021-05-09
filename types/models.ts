import type { SetType, TimeUnit, LoadUnit } from 'src/utils';

export interface User {
	id: string;
	name?: string;
	email?: string;
	exercises?: Exercise[];
}

export interface Exercise {
	id?: number;
	userId: string;
	name: string;
	exerciseInstances?: ExerciseInstance[];
}

export interface Session {
	id: number;
	userId: string;
	title: string;
	date: string;
	performances?: Performance[];
	bodyweightAmount?: number;
	bodyweightUnit: LoadUnit;
	user?: User;
}

export interface Performance {
	id: number;
	sessionId: number;
	session?: Session;
	exerciseInstances: ExerciseInstance[];
}

export interface ExerciseInstance {
	id: number;
	performanceId: number;
	performance?: Performance;
	exerciseId?: number;
	exercise?: Exercise;
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

export interface PerformanceInput {
	id: number;
	exerciseInstances: ExerciseInstanceInput[];
}

export interface ExerciseInput {
	data: {
		name: string;
		userId: string;
	};
}

export interface ExerciseInstanceInput {
	id: undefined;
	exercise?: ExerciseInput;
	exerciseId?: number;
	performanceId: undefined;
	executions: Execution[];
}
