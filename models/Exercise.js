const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	history: [
		{
			session: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Session'
			},
			date: Date,
			executions: [
				{
					sets: {
						type: Number
					},
					reps: {
						type: Number
					},
					time: {
						amount: Number,
						unit: String
					},
					load: {
						amount: Number,
						unit: String
					}
				}
			]
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
