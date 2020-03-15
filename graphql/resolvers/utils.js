// Packages
const jwt = require('jsonwebtoken');

// Models
const User = require('../../models/User');
const Session = require('../../models/Session');
const Exercise = require('../../models/Exercise');
const Template = require('../../models/Template');

exports.signToken = async (userId, email) => {
	return await jwt.sign(
		{
			userId,
			email
		},
		process.env.SECRET,
		{
			expiresIn: '30d'
		}
	);
};

exports.createExercise = async (userId, exerciseData) => {
	const user = await User.findById(userId).populate('exercises');
	const duplicate = user.exercises.find(exercise => {
		return exercise.name.trim().toLowerCase() === exerciseData.name.trim().toLowerCase();
	});
	if (duplicate) {
		throw new Error('Exercise already exists.');
	}
	const exercise = new Exercise({
		...exerciseData,
		creator: userId
	});
	const newExercise = await exercise.save();
	user.exercises.push(newExercise);
	await user.save();
	return {
		...newExercise._doc,
		_id: newExercise._id.toString()
	};
};

exports.createSession = async (userId, sessionData) => {
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

exports.createSession = async (userId, templateData) => {
	// Find user
	const user = await User.findById(userId);
	// Create template
	const template = new Template({
		...templateData,
		creator: userId
	});
	const newTemplate = await template.save();
	user.templates.push(newTemplate);
	await user.save();
	return {
		...newTemplate._doc,
		_id: newTemplate._id.toString()
	};
};
