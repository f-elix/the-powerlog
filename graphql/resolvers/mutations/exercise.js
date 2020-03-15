// Models
const Exercise = require('../../../models/Exercise');

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
