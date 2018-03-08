'use strict';
const jwt = require('jsonwebtoken');

const data = require('../data');
const json = require('../json');
const logger = require('../logger');
const {API_NAME} = require('../constant');

const options = {
	complete: true
};

const query = 'SELECT * FROM token WHERE refresh = $1';

const namespace = `${API_NAME}.token.auth`;


function auth(token) {
	logger.debug(namespace, jwt.decode(token, options));
	data.one(query, token ? [token] : token)
	.tap(o => logger.debug(namespace, {user: json.string(o)}))
	.catch(e => logger.warn(namespace, {failure: e.stack}));
}


module.exports = auth;
