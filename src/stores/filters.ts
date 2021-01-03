import { useMachine } from 'xstate-svelte';
import { filtersMachine } from '../machines/filters';

export const filters = useMachine(filtersMachine);
