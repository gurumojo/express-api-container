'use strict';
const {pick} = require('lodash');

const constant = require('../library/constant');
const json = require('../library/json');
const logger = require('../library/logger');

const EXPRESS_HOST = process.env.EXPRESS_HOST || constant.EXPRESS_HOST;

function isStatusRoute(request) {
	return (request.path === '/status' || request.baseUrl === '/status');
}

function requestLogger(request, response, next) {
	const method = isStatusRoute(request) ? 'debug' : 'info';
	logger[method](`${EXPRESS_HOST}.request`, Object.assign(
		pick(request, constant.LOGGER_WHITELIST_EXPRESS_REQUEST),
		{body: json.string(request.body)}
	));
	next();
}

module.exports = requestLogger;
