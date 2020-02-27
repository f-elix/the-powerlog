import { Machine } from 'xstate';

export const formboxMachine = Machine({
	id: 'formbox',
	initial: 'displayLogin',
	states: {
		displayLogin: {
			on: {
				SIGNUP: {
					target: 'transitionToSignup'
				}
			}
		},
		transitionToSignup: {
			on: {
				TRANSITIONEND: {
					target: 'displaySignup'
				}
			}
		},
		displaySignup: {
			on: {
				LOGIN: 'transitionToLogin'
			}
		},
		transitionToLogin: {
			on: {
				TRANSITIONEND: {
					target: 'displayLogin'
				}
			}
		}
	}
});
