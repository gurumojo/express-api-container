'use strict';
const jwt = require('jsonwebtoken');

const constant = require('../constant');
const logger = require('../logger');

const options = {
	algorithm: constant.JWT_ALGORITHM,
	audience: constant.JWT_AUDIENCE,
	expiresIn: constant.JWT_EXPIRES_IN,
	issuer: constant.JWT_ISSUER
};


function sign(payload) {
	logger.debug(`${constant.EXPRESS_HOST}.token.sign`, {payload, options});
	return jwt.sign(payload, constant.JWT_SECRET, options);
}

module.exports = sign;
