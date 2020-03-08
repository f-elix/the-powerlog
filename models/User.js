const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		log: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Session'
			}
		],
		exercises: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Exercise'
			}
		]
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('User', UserSchema);
