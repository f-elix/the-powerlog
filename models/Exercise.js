const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	history: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Session'
		}
	],
	group: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ExerciseGroup'
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
