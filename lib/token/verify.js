'use strict';
const jwt = require('jsonwebtoken');

const constant = require('../constant');
const logger = require('../logger');

const namespace = `${constant.API_NAME}.token.verify`;

const options = {
	algorithms: [constant.JWT_ALGORITHM],
	audience: constant.JWT_AUDIENCE,
	clockTolerance: constant.JWT_CLOCK_TOLERANCE,
	issuer: constant.JWT_ISSUER,
	maxAge: constant.JWT_MAX_AGE
};


function verify(token) {
	let verified = null;
	try {
		verified = jwt.verify(token, constant.JWT_SECRET, options);
		logger.debug(namespace, {verified: !!verified});
	} catch (x) {
		logger.warn(namespace, {failure: x.message});
	}
	return verified;
}


module.exports = verify;
