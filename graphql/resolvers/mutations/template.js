// Models
const Template = require('../../../models/Template');
const User = require('../../../models/User');

// Utils
const { createTemplate } = require('../utils');

const mutations = {
	// TEMPLATE MUTATIONS
	saveTemplate: async (_, { templateData }, { currentUser }) => {
		if (!currentUser) {
			const error = new Error('Not authenticated');
			error.statusCode = 401;
			throw error;
		}
		// If no id, template doesn't exist so create one and return it
		if (!templateData._id) {
			return await createTemplate(currentUser.userId, templateData);
		}
		// Find template
		const template = await Template.findById(templateData._id);
		if (!template) {
			const error = new Error('No template found.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (template.creator._id.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Create exercises if they don't already exist
		const movements = templateData.exercises.map(exercise => exercise.movements).flat();
		for (const movement of movements) {
			const exerciseData = {
				_id: movement.exercise._id,
				name: movement.exercise.name
			};
			await createExercise(userId, exerciseData, true);
		}
		// Update template
		template.name = templateData.name;
		template.exercises = templateData.exercises;
		template.instructions = templateData.instructions;
		let updatedTemplate = await template.save();
		updatedTemplate = await updatedTemplate.populate('exercises.movements.exercise').execPopulate();
		// Return template
		return {
			...updatedTemplate._doc,
			_id: updatedTemplate._id.toString()
		};
	},
	deleteTemplate: async (_, { templateId }, { currentUser }) => {
		// Find template
		const template = await Template.findById(templateId);
		if (!template) {
			const error = new Error('Template does not exist.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (template.creator.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Delete template
		await Template.findByIdAndRemove(templateId);
		// Update user docs
		const user = await User.findById(currentUser.userId);
		user.templates.pull(templateId);
		await user.save();
		// Return
		return true;
	}
};

module.exports = mutations;
