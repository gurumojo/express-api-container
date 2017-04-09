'use strict';

/**
 * Express middleware to capture request datetime {string}
 */
function datetime(request, response, next) {
	request.datetime = new Date().toISOString();
	next();
}

module.exports = datetime;
