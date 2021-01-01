import { useMachine } from 'xstate-svelte';
import { logMachine } from '../machines/log';

export const log = useMachine(logMachine);
