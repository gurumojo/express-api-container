'use strict';

const constant = require('../library/constant');
const logger = require('../library/logger');

const EXPRESS_HOST = process.env.EXPRESS_HOST || constant.EXPRESS_HOST;


function dispatch(level, flash) {
	flash.forEach(message =>
		logger[level](`${EXPRESS_HOST}.message`, message)
	);
}

function flashLogger(request, response, next) {
	Object.keys(logger).forEach(method => {
		response.locals[method] = request.flash(method);
		if (response.locals[method].length) {
			dispatch(method, response.locals[method]);
		}
	});
	next();
}

module.exports = flashLogger;
