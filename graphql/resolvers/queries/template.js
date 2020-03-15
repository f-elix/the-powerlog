// Models
const Template = require('../../../models/Template');

const queries = {
	// TEMPLATE QUERIES
	getTemplateById: async (_, { templateId }, { currentUser }) => {
		// Find session
		const template = await Template.findById(templateId).populate('exercises.movements.exercise');
		if (!template) {
			const error = new Error('Template not found.');
			error.statusCode = 404;
			throw error;
		}
		// Validate user
		if (template.creator.toString() !== currentUser.userId) {
			const error = new Error('Not authorized.');
			error.statusCode = 403;
			throw error;
		}
		// Return template
		return {
			...template._doc,
			_id: template._id.toString()
		};
	}
};

module.exports = queries;
