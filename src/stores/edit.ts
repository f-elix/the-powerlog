import { useMachine } from 'xstate-svelte';
import { editMachine } from '../machines/edit';

export const edit = useMachine(editMachine);
