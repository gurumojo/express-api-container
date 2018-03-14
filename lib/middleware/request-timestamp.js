'use strict';

/**
 * Express middleware to capture request timestamp {number}
 */
function timestamp(request, response, next) {
	request.timestamp = Date.now();
	next();
}

module.exports = timestamp;
