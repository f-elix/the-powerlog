// Packages
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Model
const User = require('../../../models/User');

// Utils
const { signToken } = require('../utils');

const mutations = {
	// USER MUTATIONS
	signupUser: async (_, { name, email, password }) => {
		// Validate input
		const error = new Error();
		error.statusCode = 400;
		if (!validator.isEmail(email)) {
			error.message = 'Invalid email address.';
			throw error;
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			error.message = 'This email address is already taken.';
			throw error;
		}
		if (!validator.isLength(password, { min: 6 })) {
			error.message = 'Password must have at least 6 characters.';
			throw error;
		}
		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);
		// Create and save user to DB
		const newUser = new User({
			name,
			email,
			password: hashedPassword
		});
		await newUser.save();
		// Assign token
		const token = await signToken(newUser._id.toString(), newUser.email);
		// Return user auth data
		return {
			userId: newUser._id.toString(),
			token
		};
	},
	loginUser: async (_, { email, password }) => {
		// Validate input
		const error = new Error();
		error.statusCode = 400;
		if (!validator.isEmail(email)) {
			error.message = 'Invalid email address.';
			throw error;
		}
		// Find user
		const user = await User.findOne({ email }).populate('log');
		if (!user) {
			error.message = 'User not found.';
			error.statusCode = 404;
			throw error;
		}
		// Verify password
		let isPasswordValid;
		try {
			isPasswordValid = await bcrypt.compare(password, user.password);
		} catch (err) {
			throw err;
		}
		if (!isPasswordValid) {
			error.message = 'Invalid password.';
			throw error;
		}
		// Assign token
		const token = await signToken(user._id.toString(), user.email);
		// Return user auth data
		return {
			userId: user._id.toString(),
			token
		};
	}
};

module.exports = mutations;
