// Models
const Exercise = require('../../../models/Exercise');
const User = require('../../../models/User');

// Utils
const { createExercise } = require('../utils');

const mutations = {
	// EXERCISE MUTATIONS
	saveExercise: async (_, { exerciseData }, { currentUser }) => {
		if (!currentUser) {
			const error = new Error('Not authenticated');
			error.statusCode = 401;
			throw error;
		}
		// Find exercise
		const exercise = await Exercise.findById(exerciseData._id);
		// If no exercise found, create one and return it
		if (!exercise) {
			return await createExercise(currentUser.userId, exerciseData, false);
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
			_id: updatedExercise._id.toString()
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
