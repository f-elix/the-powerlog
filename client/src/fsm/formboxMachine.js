import { Machine } from 'xstate';

export const formboxMachine = Machine({
	id: 'formbox',
	initial: 'displayLogin',
	states: {
		displayLogin: {
			on: {
				SIGNUP: {
					target: 'transitioning'
				}
			}
		},
		transitioning: {
			on: {
				LOGIN_TRANSITIONEND: {
					target: 'displaySignup'
				},
				SIGNUP_TRANSITIONEND: {
					target: 'displayLogin'
				},
			}
		},
		displaySignup: {
			on: {
				LOGIN: 'transitioning'
			}
		},
	}
});
