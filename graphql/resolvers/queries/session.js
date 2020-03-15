// Models
const Session = require('../../../models/Session');

const queries = {
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
	}
};

module.exports = queries;
