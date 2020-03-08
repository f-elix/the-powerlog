const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
	name: {
		type: String,
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
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
});

module.exports = mongoose.model('Template', TemplateSchema);
