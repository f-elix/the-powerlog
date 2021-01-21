import { useMachine } from 'src/lib/xstate-svelte';
import { sessionMachine } from 'src/machines/session';

export const session = useMachine(sessionMachine);
