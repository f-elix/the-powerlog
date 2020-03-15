const userMutations = require('./user');
const sessionMutations = require('./session');
const exerciseMutations = require('./exercise');

const mutations = {
	...userMutations,
	...sessionMutations,
	...exerciseMutations
};

module.exports = mutations;
