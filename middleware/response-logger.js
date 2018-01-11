'use strict';
const {pick} = require('lodash');

const constant = require('../library/constant');
const logger = require('../library/logger');
const {isStatusRoute} = require('../library/request');

const namespace = `${constant.API_NAME}.response`;


function responseLogger(request, response, next) {
	const send = response.send;
	let called = false;
	response.send = body => {
		send.apply(response, [body]);
		if (!called) {
			called = true;
			let method = 'info';
			if (response.statusCode >= 500) {
				method = 'error';
			} else if (response.statusCode >= 400) {
				method = 'warn';
			}
			if (isStatusRoute(request)) {
				method = 'debug';
			}
			logger[method](namespace, Object.assign(
				pick(response, constant.LOGGER_WHITELIST_EXPRESS_RESPONSE),
				{body}
			));
		}
	};
	next();
}


module.exports = responseLogger;
