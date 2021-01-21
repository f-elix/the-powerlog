import { useMachine } from 'src/lib/xstate-svelte';
import { filtersMachine } from 'src/machines/filters';

export const filters = useMachine(filtersMachine);
