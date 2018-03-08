'use strict';
const jwt = require('jsonwebtoken');

const constant = require('../constant');
const logger = require('../logger');

const options = {
	complete: true
};


function decode(token) {
	return jwt.decode(token, options);
}


module.exports = decode;
