import { useMachine } from '@xstate/svelte';
import { logMachine } from 'src/machines/log';

export const log = useMachine(logMachine);
