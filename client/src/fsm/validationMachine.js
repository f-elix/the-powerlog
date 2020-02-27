import { Machine, assign } from 'xstate';
import isEmail from 'validator/es/lib/isEmail';

const utils = {
	requiredPasswordLength: 6,
	nameErrorEmpty: 'Name is required.',
	emailErrorEmpty: 'Email is required.',
	emailErrorBadFormat: 'Please provide a valid email.',
	passwordErrorEmpty: 'Password is required.',
	passwordErrorTooShort: function() {
		return 'Password must have at least ' + this.requiredPasswordLength + ' characters.';
	}
};

const guards = {
	isNameEmpty: (context, _) => context.name.length === 0,
	isEmailEmpty: (context, _) => context.email.length === 0,
	isBadEmail: (context, _) => context.email.length > 0 && !isEmail(context.email),
	isPasswordEmpty: (context, _) => context.password.length === 0,
	isPasswordShort: (context, _) => context.password.length < utils.requiredPasswordLength
};

const actions = {
	updateName: assign({
		name: (_, event) => event.params.value
	}),
	updateEmail: assign({
		email: (_, event) => event.params.value
	}),
	updatePassword: assign({
		password: (_, event) => event.params.value
	}),
	nameErrorEmpty: assign({
		nameError: utils.nameErrorEmpty
	}),
	emailErrorEmpty: assign({
		emailError: utils.passwordErrorEmpty
	}),
	emailErrorBadFormat: assign({
		emailError: utils.emailErrorBadFormat
	}),
	passwordErrorEmpty: assign({
		passwordError: utils.passwordErrorEmpty
	}),
	passwordErrorTooShort: assign({
		passwordError: utils.passwordErrorTooShort()
	}),
	clearNameError: assign({
		nameError: ''
	}),
	clearEmailError: assign({
		emailError: ''
	}),
	clearPasswordError: assign({
		passwordError: ''
	})
};

export const validationMachine = Machine(
	{
		id: 'validation',
		context: {
			name: '',
			email: '',
			password: '',
			nameError: '',
			emailError: '',
			passwordError: ''
		},
		initial: 'idle',
		states: {
			idle: {
				type: 'parallel',
				on: {
					INPUT_NAME: {
						actions: ['updateName', 'clearNameError'],
						target: 'idle.name.valid'
					},
					INPUT_EMAIL: {
						actions: ['updateEmail', 'clearEmailError'],
						target: 'idle.email.valid'
					},
					INPUT_PASSWORD: {
						actions: ['updatePassword', 'clearPasswordError'],
						target: 'idle.password.valid'
					},
					SUBMIT_SIGNUP: [
						{
							cond: 'isNameEmpty',
							target: 'idle.name.invalid.empty'
						},
						{
							cond: 'isEmailEmpty',
							target: 'idle.email.invalid.empty'
						},
						{
							cond: 'isBadEmail',
							target: 'idle.email.invalid.badFormat'
						},
						{
							cond: 'isPasswordEmpty',
							target: 'idle.password.invalid.empty'
						},
						{
							cond: 'isPasswordShort',
							target: 'idle.password.invalid.tooShort'
						},
						{
							target: 'valid'
						}
					],
					SUBMIT_LOGIN: [
						{
							cond: 'isEmailEmpty',
							target: 'idle.email.invalid.empty'
						},
						{
							cond: 'isBadEmail',
							target: 'idle.email.invalid.badFormat'
						},
						{
							cond: 'isPasswordEmpty',
							target: 'idle.password.invalid.empty'
						},
						{
							cond: 'isPasswordShort',
							target: 'idle.password.invalid.tooShort'
						},
						{
							target: 'valid'
						}
					]
				},
				states: {
					name: {
						initial: 'valid',
						states: {
							valid: {},
							invalid: {
								initial: 'empty',
								states: {
									empty: {
										entry: ['nameErrorEmpty']
									}
								}
							}
						}
					},
					email: {
						initial: 'valid',
						states: {
							valid: {},
							invalid: {
								initial: 'empty',
								states: {
									empty: {
										entry: ['emailErrorEmpty']
									},
									badFormat: {
										entry: ['emailErrorBadFormat']
									}
								}
							}
						}
					},
					password: {
						initial: 'valid',
						states: {
							valid: {},
							invalid: {
								initial: 'empty',
								states: {
									empty: {
										entry: ['passwordErrorEmpty']
									},
									tooShort: {
										entry: ['passwordErrorTooShort']
									}
								}
							}
						}
					}
				}
			},
			valid: {
				type: 'final'
			}
		}
	},
	{
		guards,
		actions
	}
);
