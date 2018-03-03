'use strict';
const {pick} = require('lodash');

const constant = require('../library/constant');
const json = require('../library/json');
const logger = require('../library/logger');
const {isStatusRoute} = require('../library/request');

const namespace = `${constant.API_NAME}.response`;


function responseLogger(request, response, next) {
	let logged = false;
	let send = response.send;
	response.send = body => {
		send.apply(response, [body]);
		if (!logged) {
			let headers = response.getHeaders();
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
				{
					body: json.string(json.object(body) || body),
					headers: json.string(headers)
				}
			));
			logged = true;
		}
	};
	next();
}


module.exports = responseLogger;
