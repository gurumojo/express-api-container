'use strict';
const {pick} = require('lodash');

const constant = require('../constant');
const json = require('../json');
const logger = require('../logger');
const {isStatusRoute} = require('../request');

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
