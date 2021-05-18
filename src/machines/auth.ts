import { createMachine } from 'xstate';
import { createModel } from 'xstate/lib/model';

const authModel = createModel(
	{},
	{
		events: {
			SIGNUP: () => ({ value: 'SIGNUP' }),
			SUBMIT: () => ({ value: 'SUBMIT' })
		}
	}
);

type AuthState =
	| {
			value: 'idle';
			context: Record<string, unknown>;
	  }
	| {
			value: 'login';
			context: Record<string, unknown>;
	  }
	| {
			value: 'login.idle';
			context: Record<string, unknown>;
	  }
	| {
			value: 'login.fetching';
			context: Record<string, unknown>;
	  }
	| {
			value: 'signup';
			context: Record<string, unknown>;
	  }
	| {
			value: 'signup.idle';
			context: Record<string, unknown>;
	  }
	| {
			value: 'signup.verifyingEmail';
			context: Record<string, unknown>;
	  }
	| {
			value: 'signup.fetching';
			context: Record<string, unknown>;
	  }
	| {
			value: 'loggedIn';
			context: Record<string, unknown>;
	  };

export const authMachine = createMachine<typeof authModel, AuthState>({
	id: 'auth',
	initial: 'login',
	states: {
		login: {
			initial: 'idle',
			states: {
				idle: {
					on: {
						SUBMIT: {
							target: 'login.fetching'
						},
						SIGNUP: {
							target: '#auth.signup'
						}
					}
				},
				fetching: {}
			}
		},
		signup: {
			initial: 'idle',
			states: {
				idle: {
					on: {
						SUBMIT: 'signup.verifyingEmail'
					}
				},
				verifyingEmail: {},
				fetching: {}
			}
		},
		loggedIn: {
			type: 'final'
		}
	}
});
