// Packages
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Models
const User = require('../../models/User');
const Session = require('../../models/Session');
const Exercise = require('../../models/Exercise');

// Utils
const signToken = require('../../utils/signToken');
const createSession = require('../../utils/createSession');
const createExercise = require('../../utils/createExercise');

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
	},
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
	},
	// EXERCISE MUTATIONS
	saveExercise: async (_, { exerciseData }, { currentUser }) => {
		if (!currentUser) {
			const error = new Error('Not authenticated');
			error.statusCode = 401;
			throw error;
		}
		// If no id, exercise doesn't exist so create one and return it
		if (!exerciseData._id) {
			return await createExercise(currentUser.userId, exerciseData);
		}
		// Find exercise
		const exercise = await (await Exercise.findById(exerciseData._id)).populate('history');
		if (!exercise) {
			const error = new Error('No exercise created yet.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (exercise.creator._id.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Update exercise
		exercise.name = exerciseData.name;
		const updatedExercise = await exercise.save();
		// Return exercise
		return {
			...updatedExercise._doc,
			_id: updatedSession._id.toString()
		};
	},
	deleteExercise: async (_, { exerciseId }, { currentUser }) => {
		// Find exercise
		const exercise = await Exercise.findById(exerciseId);
		if (!exercise) {
			const error = new Error('Exercise does not exist.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (exercise.creator.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Delete exercise
		await Exercise.findByIdAndRemove(exerciseId);
		// Update user docs
		const user = await User.findById(currentUser.userId);
		user.exercises.pull(exerciseId);
		await user.save();
		// Return
		return true;
	}
};

module.exports = mutations;
