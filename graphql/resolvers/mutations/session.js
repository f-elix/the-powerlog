// Models
const Session = require('../../../models/Session');
const User = require('../../../models/User');

// Utils
const { createSession } = require('../utils');

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
		const updatedSession = await session.save();
		// Update exercises history
		const movements = session.exercises.map(exercise => exercise.movements).flat();
		for (const movement of movements) {
			const newHistory = {
				session,
				date: session.date,
				executions: movement.executions
			};
			const exerciseId = movement.exercise._id;
			const exerciseToUpdate = await Exercise.findById(exerciseId);
			exerciseToUpdate.history.push(newHistory);
			await exerciseToUpdate.save();
		}
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
		// Return
		return true;
	}
};

module.exports = mutations;
