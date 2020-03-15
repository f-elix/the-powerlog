// Packages
const jwt = require('jsonwebtoken');

// Models
const User = require('../../../models/User');

const queries = {
	// USER QUERIES
	isAuth: async (_, { token }, {}) => {
		try {
			await jwt.verify(token, process.env.SECRET);
			return true;
		} catch (err) {
			return false;
		}
	},
	getUserData: async (_, args, { currentUser }) => {
		if (!currentUser) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 403;
			throw error;
		}
		const user = await User.findById(currentUser.userId);
		if (!user) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 403;
			throw error;
		}
		return {
			...user._doc,
			createdAt: user.createdAt.toISOString().split('T')[0],
			updatedAt: user.updatedAt.toISOString().split('T')[0]
		};
	}
};

module.exports = queries;
