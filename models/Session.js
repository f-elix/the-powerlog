const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	date: {
		type: Date
	},
	exercises: [
		{
			_id: mongoose.Schema.Types.ObjectId,
			movements: [
				{
					exercise: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Exercise'
					},
					executions: [
						{
							_id: mongoose.Schema.Types.ObjectId,
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
			]
		}
	],
	bodyweight: {
		amount: Number,
		unit: String
	},
	notes: {
		type: String
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
});

module.exports = mongoose.model('Session', SessionSchema);
