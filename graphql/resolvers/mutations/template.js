// Models
const Template = require('../../../models/Template');

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
		// Update template
		template.name = templateData.name;
		template.exercises = templateData.exercises;
		template.notes = templateData.notes;
		let updatedTemplate = await template.save();
		updatedTemplate = await updatedTemplate.populate('exercises.movements.exercise').execPopulate();
		// Return template
		return {
			...updatedTemplate._doc,
			_id: updatedTemplate._id.toString()
		};
	},
	deleteTemplate: async (_, {}, { currentUser }) => {}
};

module.exports = mutations;
