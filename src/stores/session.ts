import { useMachine } from '@xstate/svelte';
import { sessionMachine } from 'src/machines/session';

export const session = useMachine(sessionMachine);
