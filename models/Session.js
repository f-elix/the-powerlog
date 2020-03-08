const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	exercises: [
		{
			movements: [
				{
					exercise: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Exercise'
					},
					executions: [
						{
							sets: {
								type: Number
							},
							repsOrTime: {
								amount: Number,
								unit: String
							},
							weight: {
								amount: Number,
								unit: String
							},
							restTime: {
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
