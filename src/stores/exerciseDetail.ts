import { useMachine } from '@xstate/svelte';
import { exerciseDetailMachine } from 'src/machines/exerciseDetail';

export const exerciseDetail = useMachine(exerciseDetailMachine);
