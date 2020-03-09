// Packages
const jwt = require('jsonwebtoken');

// Models
const User = require('../../models/User');
const Session = require('../../models/Session');
const Exercise = require('../../models/Exercise');

const queries = {
	// USER QUERIES
	getUserData: async (_, args, { currentUser }) => {
		if (!currentUser) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 403;
			throw error;
		}
		const user = await User.findById(currentUser.userId);
		return {
			...user._doc,
			createdAt: user.createdAt.toISOString().split('T')[0],
			updatedAt: user.updatedAt.toISOString().split('T')[0]
		};
	},
	isAuth: async (_, { token }, {}) => {
		try {
			await jwt.verify(token, process.env.SECRET);
			return true;
		} catch (err) {
			return false;
		}
	},
	// SESSION QUERIES
	getSessionById: async (_, { sessionId }, { currentUser }) => {
		// Find session
		const session = await Session.findById(sessionId);
		if (!session) {
			const error = new Error('Session not found.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (session.creator.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Return session
		return {
			...session._doc,
			_id: session._id.toString()
		};
	},
	getSessionsByDate: async (_, { sessionDate }, { currentUser }) => {
		// Find user
		const user = await User.findById(currentUser.userId).populate('log');
		if (!user) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 401;
			throw error;
		}
		// Find sessions in user log
		const sessions = user.log
			.filter(session => {
				return session.sessionDate.getTime() === sessionDate.getTime();
			})
			.reverse();
		// Return session
		return sessions.map(session => {
			return {
				...session._doc,
				_id: session._id.toString()
			};
		});
	},
	getSessionsByTitle: async (_, { name }, { currentUser }) => {
		// Find user by ID and populate user's log
		const user = await User.findById(currentUser.userId).populate('log');
		if (!user) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 401;
			throw error;
		}
		// Filter log by name
		const filteredSessions = user.log
			.filter(session => {
				return session.name.toLowerCase().includes(name.toLowerCase());
			})
			.reverse();
		// Return filtered array of sessions
		return filteredSessions.map(session => {
			return {
				...session._doc,
				_id: session._id.toString()
			};
		});
	},
	getSessionsFromTo: async (_, { fromDate, toDate }, { currentUser }) => {
		// Find user by ID and populate user's log
		const user = await User.findById(currentUser.userId).populate('log');
		if (!user) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 401;
			throw error;
		}
		// Filter log by sessionDate
		const filteredSessions = user.log
			.filter(session => {
				return session.sessionDate >= fromDate && session.sessionDate <= toDate;
			})
			.reverse();
		// Return filtered array of sessions
		return filteredSessions.map(session => {
			return {
				...session._doc,
				_id: session._id.toString()
			};
		});
	},
	getSessionRange: async (_, { from, to }, { currentUser }) => {
		// Find user by ID and populate user's log
		const user = await User.findById(currentUser.userId).populate('log');
		if (!user) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 401;
			throw error;
		}
		// Filter session range
		const filteredSessions = user.log.reverse().filter((session, i) => {
			const position = i + 1;
			return position >= from && position <= to;
		});
		// Return filtered array of sessions
		return filteredSessions.map(session => {
			return {
				...session._doc,
				_id: session._id.toString()
			};
		});
	},
	// EXERCISE QUERIES
	getExerciseById: async (_, { exerciseId }, { currentUser }) => {
		// Find exercise
		const exercise = await Exercise.findById(exerciseId);
		if (!exercise) {
			const error = new Error('Exercise not found.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (exercise.creator.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Return exercise
		return {
			...exercise._doc,
			_id: exercise._id.toString()
		};
	},
	getExercisesByName: async (_, { name }, { currentUser }) => {
		// Find user by ID and populate user's exercises
		const user = await User.findById(currentUser.userId).populate('exercises');
		if (!user) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 401;
			throw error;
		}
		// Find exercises in user exercises collection
		const filteredExercises = user.exercises
			.filter(ex => {
				return ex.name.toLowerCase().includes(name.toLowerCase());
			})
			.reverse();
		// Return filtered array of exercises
		return filteredExercises.map(exercise => {
			return {
				...exercise._doc,
				_id: exercise._id.toString()
			};
		});
	},
	getAllExercises: async (_, {}, { currentUser }) => {
		// Find user by ID and populate user's exercises
		const user = await User.findById(currentUser.userId).populate('exercises');
		if (!user) {
			const error = new Error('Your session has ended. Please sign in again.');
			error.statusCode = 401;
			throw error;
		}
		// Return array of exercises
		return user.exercises.map(exercise => {
			return {
				...exercise._doc,
				_id: exercise._id.toString()
			};
		});
	}
};

module.exports = queries;
