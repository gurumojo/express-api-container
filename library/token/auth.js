'use strict';
const jwt = require('jsonwebtoken');

const constant = require('../constant');
const data = require('../data');
const json = require('../json');
const logger = require('../logger');

const options = {
	complete: true
};

const query = 'SELECT * FROM token WHERE refresh = $1';


function auth(token) {
	logger.debug(`${constant.EXPRESS_HOST}.token.auth`, jwt.decode(token, options));
	data.one(query, token ? [token] : token)
	.tap(o => logger.debug(`${constant.EXPRESS_HOST}.token.auth`, {user: json.string(o)}))
	.catch(e => logger.warn(`${constant.EXPRESS_HOST}.token.auth`, {error: e.stack}));
}


module.exports = auth;
