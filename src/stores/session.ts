import { useMachine } from 'xstate-svelte';
import { sessionMachine } from '../machines/session';

export const session = useMachine(sessionMachine);
