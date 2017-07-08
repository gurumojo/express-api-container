'use strict';
const {pick} = require('lodash');

const constant = require('../library/constant');
const logger = require('../library/logger');


function isStatusRoute(request) {
	return (request.path === '/status' || request.baseUrl === '/status');
}

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
			logger[method](`${constant.EXPRESS_HOST}.response`, Object.assign(
				pick(response, constant.LOGGER_WHITELIST_EXPRESS_RESPONSE),
				{body}
			));
		}
	};
	next();
}


module.exports = responseLogger;
