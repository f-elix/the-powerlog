// Models
const User = require('../models/User');
const Exercise = require('../models/Exercise');

const createExercise = async (userId, exerciseData) => {
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

module.exports = createExercise;
