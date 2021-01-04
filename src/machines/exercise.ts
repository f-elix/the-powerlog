import { createMachine } from 'xstate';

interface ExerciseContext {
	name: string;
}

export type ExerciseEvent = { type: '' };

export const exerciseMachine = createMachine<ExerciseContext>({
	id: 'exercise'
});
