'use strict';

const constant = require('../constant');
const json = require('../json');
const logger = require('../logger');

const namespace = `${constant.API_NAME}.token.validate`;

function inspect(jwt) {
	if (jwt.header.typ !== 'JWT') {
		throw new Error('JWT input type required');
	}
	if (jwt.header.alg !== constant.JWT_ALGORITHM) {
		throw new Error(`${constant.JWT_ALGORITHM} algorithm required`);
	}
	if (jwt.payload.aud !== constant.JWT_AUDIENCE) {
		throw new Error(`${constant.JWT_AUDIENCE} audience required`);
	}
	if (jwt.payload.iss !== constant.JWT_ISSUER) {
		throw new Error(`${constant.JWT_ISSUER} issuer required`);
	}
}

function validate(jwt) {
	let valid = false;
	try {
		inspect(jwt);
		valid = true;
		logger.debug(namespace, {valid});
	} catch (x) {
		logger.warn(namespace, {failure: x.message});
	}
	return valid;
}

module.exports = validate;
