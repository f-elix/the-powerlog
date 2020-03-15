const userMutations = require('./user');
const sessionMutations = require('./session');
const exerciseMutations = require('./exercise');
const templateMutations = require('./template');

const mutations = {
	...userMutations,
	...sessionMutations,
	...exerciseMutations,
	...templateMutations
};

module.exports = mutations;
