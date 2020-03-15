// Models
const User = require('../../../models/User');
const Exercise = require('../../../models/Exercise');

const queries = {
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
