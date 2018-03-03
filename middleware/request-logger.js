'use strict';
const {pick} = require('lodash');

const constant = require('../library/constant');
const json = require('../library/json');
const logger = require('../library/logger');
const {isStatusRoute} = require('../library/request');

const namespace = `${constant.API_NAME}.request`;


function requestLogger(request, response, next) {
	let body = json.string(request.body) || request.body;
	let method = isStatusRoute(request) ? 'debug' : 'info';
	logger[method](namespace, Object.assign(
		pick(request, constant.LOGGER_WHITELIST_EXPRESS_REQUEST),
		{
			body: body === '{}' ? null : body,
			headers: json.string(request.headers)
		}
	));
	next();
}


module.exports = requestLogger;
