const userQueries = require('./user');
const sessionQueries = require('./session');
const exerciseQueries = require('./exercise');
const templateQueries = require('./template');

const queries = {
	...userQueries,
	...sessionQueries,
	...exerciseQueries,
	...templateQueries
};

module.exports = queries;
