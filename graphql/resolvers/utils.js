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

const createExercise = (exports.createExercise = async (userId, exerciseData, returnDuplicate) => {
	const user = await User.findById(userId).populate('exercises');
	const duplicate = user.exercises.find(exercise => {
		return exercise.name.trim().toLowerCase() === exerciseData.name.trim().toLowerCase();
	});
	if (duplicate) {
		if (returnDuplicate) {
			return {
				...duplicate._doc,
				_id: duplicate._id.toString()
			};
		} else {
			throw new Error(`An exercise with the name "${duplicate.name}" already exists.`);
		}
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
});

const updateExerciseHistory = (exports.updateExerciseHistory = async (userId, session, exercises) => {
	const movements = exercises.map(exercise => exercise.movements).flat();
	for (const movement of movements) {
		const newHistory = {
			session,
			date: session.date,
			executions: movement.executions
		};
		const exerciseId = movement.exercise._id;
		let exerciseToUpdate = await Exercise.findById(exerciseId);
		if (!exerciseToUpdate) {
			const exerciseData = {
				_id: exerciseId,
				name: movement.exercise.name,
				history: []
			};
			const exercise = await createExercise(userId, exerciseData, true);
			exerciseToUpdate = await Exercise.findById(exercise._id);
		}
		exerciseToUpdate.history.push(newHistory);
		await exerciseToUpdate.save();
	}
});

exports.removeFromExerciseHistory = async session => {
	const movements = session.exercises.map(exercise => exercise.movements).flat();
	for (const movement of movements) {
		const exerciseId = movement.exercise._id;
		const exerciseToUpdate = await Exercise.findById(exerciseId);
		exerciseToUpdate.history = exerciseToUpdate.history.filter(
			h => h.session.toString() !== session._id.toString()
		);
		await exerciseToUpdate.save();
	}
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
	// Update exercises history
	updateExerciseHistory(userId, newSession, sessionData.exercises);
	// Update user
	user.log.push(newSession);
	await user.save();
	// Return session
	return {
		...newSession._doc,
		_id: newSession._id.toString()
	};
};

exports.createTemplate = async (userId, templateData) => {
	// Find user
	const user = await User.findById(userId);
	// Create template
	const template = new Template({
		...templateData,
		creator: userId
	});
	let newTemplate = await template.save();
	newTemplate = await newTemplate.populate('exercises.movements.exercise').execPopulate();
	// Create exercises if they don't already exist
	const movements = templateData.exercises.map(exercise => exercise.movements).flat();
	for (const movement of movements) {
		const exerciseData = {
			_id: movement.exercise._id,
			name: movement.exercise.name
		};
		await createExercise(userId, exerciseData, true);
	}
	// Update user
	user.templates.push(newTemplate);
	await user.save();
	// Return new template
	return {
		...newTemplate._doc,
		_id: newTemplate._id.toString()
	};
};
