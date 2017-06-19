'use strict';
const jwt = require('jsonwebtoken');

const constant = require('../constant');
const logger = require('../logger');

const options = {
	algorithms: [constant.JWT_ALGORITHM],
	audience: constant.JWT_AUDIENCE,
	clockTolerance: constant.JWT_CLOCK_TOLERANCE,
	issuer: constant.JWT_ISSUER,
	maxAge: constant.JWT_MAX_AGE
};


function verify(token) {
	logger.debug(`${constant.EXPRESS_HOST}.token.verify`, {
		token: jwt.decode(token, {complete: true})
	});
	return jwt.verify(token, constant.JWT_SECRET, options);
}

module.exports = verify;
