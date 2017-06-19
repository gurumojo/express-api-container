'use strict';
const jwt = require('jsonwebtoken');

const constant = require('../constant');
const logger = require('../logger');

const options = {
	complete: true
};


function decode(token) {
	const object = jwt.decode(token, options);
	logger.debug(`${constant.EXPRESS_HOST}.token.decode`, object);
	return object;
}

module.exports = decode;
