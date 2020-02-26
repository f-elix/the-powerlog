import { Machine, assign } from 'xstate';
import isEmail from 'validator/es/lib/isEmail';
import { requiredPasswordLength } from '@/assets/js/utils.js';

const guards = {
	isNameEmpty: (context, _) => context.name.length === 0,
	isEmailEmpty: (context, _) => context.email.length === 0,
	isBadEmail: (context, _) => context.email.length > 0 && isEmail(context.email),
	isPasswordEmpty: (context, _) => context.password.length === 0,
	isPasswordShort: (context, _) => context.password.length < requiredPasswordLength
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
	})
};

export const formMachine = Machine(
	{
		id: 'form',
		context: {
			name: '',
			email: '',
			password: ''
		},
		initial: 'idle',
		states: {
			idle: {
				type: 'parallel',
				on: {
					INPUT_NAME: {
						actions: ['updateName'],
						target: 'idle.name.valid'
					},
					INPUT_EMAIL: {
						actions: ['updateEmail'],
						target: 'idle.email.valid'
					},
					INPUT_PASSWORD: {
						actions: ['updatePassword'],
						target: 'idle.password.valid'
					},
					SUBMIT: [
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
							target: 'success'
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
									empty: {}
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
									empty: {},
									badFormat: {}
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
									empty: {},
									tooShort: {}
								}
							}
						}
					}
				}
			},
			success: {
				type: 'final'
			}
		}
	},
	{
		guards,
		actions
	}
);
