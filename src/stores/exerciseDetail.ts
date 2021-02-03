import { useMachine } from 'src/lib/xstate-svelte';
import { exerciseDetailMachine } from 'src/machines/exerciseDetail';

export const exerciseDetail = useMachine(exerciseDetailMachine);
