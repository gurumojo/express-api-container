'use strict';
const jwt = require('jsonwebtoken');

const options = {
	complete: true
};


function decode(token) {
	return jwt.decode(token, options);
}


module.exports = decode;
