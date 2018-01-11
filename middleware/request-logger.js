'use strict';
const {pick} = require('lodash');

const constant = require('../library/constant');
const json = require('../library/json');
const logger = require('../library/logger');
const {isStatusRoute} = require('../library/request');

const namespace = `${constant.API_NAME}.request`;


function requestLogger(request, response, next) {
	const method = isStatusRoute(request) ? 'debug' : 'info';
	logger[method](namespace, Object.assign(
		pick(request, constant.LOGGER_WHITELIST_EXPRESS_REQUEST),
		{body: json.string(request.body)}
	));
	next();
}


module.exports = requestLogger;
