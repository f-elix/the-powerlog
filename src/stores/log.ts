import { usePersistedMachine } from 'src/utils';
import { logMachine } from '../machines/log';

export const log = usePersistedMachine(logMachine);
