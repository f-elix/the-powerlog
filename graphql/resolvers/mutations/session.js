// Models
const Session = require('../../../models/Session');
const User = require('../../../models/User');
const Exercise = require('../../../models/Exercise');

// Utils
const { createSession, updateExerciseHistory, removeFromExerciseHistory } = require('../utils');

const mutations = {
	// SESSION MUTATIONS
	saveSession: async (_, { sessionData }, { currentUser }) => {
		if (!currentUser) {
			const error = new Error('Not authenticated');
			error.statusCode = 401;
			throw error;
		}
		// If no id, session doesn't exist so create one and return it
		if (!sessionData._id) {
			return await createSession(currentUser.userId, sessionData);
		}
		// Find session
		const session = await Session.findById(sessionData._id).populate('creator');
		if (!session) {
			const error = new Error('No session found.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (session.creator._id.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Update session
		session.name = sessionData.name;
		session.date = sessionData.date;
		session.exercises = sessionData.exercises;
		session.bodyweight = sessionData.bodyweight;
		session.notes = sessionData.notes;
		session.templateInstructions = sessionData.templateInstructions;
		const updatedSession = await session.save();
		// Update exercises history
		updateExerciseHistory(currentUser.userId, session, sessionData.exercises);
		// Return session
		return {
			...updatedSession._doc,
			_id: updatedSession._id.toString()
		};
	},
	deleteSession: async (_, { sessionId }, { currentUser }) => {
		// Find session
		const session = await Session.findById(sessionId);
		if (!session) {
			const error = new Error('Session does not exist.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (session.creator.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Delete session
		await Session.findByIdAndRemove(sessionId);
		// Update user docs
		const user = await User.findById(currentUser.userId);
		user.log.pull(sessionId);
		await user.save();
		// Remove from exercises history
		removeFromExerciseHistory(session);
		// Return
		return true;
	}
};

module.exports = mutations;
