const mongoose = require('mongoose');

const ExerciseGroupSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	color: {
		type: String
	},
	exercises: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Exercise'
		}
	],
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
});

module.exports = mongoose.model('ExerciseGroup', ExerciseGroupSchema);
