// Models
const User = require('../models/User');
const Session = require('../models/Session');

const createSession = async (userId, sessionData) => {
	// Find user
	const user = await User.findById(userId);
	// Create session
	const session = new Session({
		...sessionData,
		creator: userId
	});
	const newSession = await session.save();
	user.log.push(newSession);
	await user.save();
	// Update exercises history
	const movements = newSession.exercises.map(exercise => exercise.movements).flat();
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
	return {
		...newSession._doc,
		_id: newSession._id.toString()
	};
};

module.exports = createSession;
