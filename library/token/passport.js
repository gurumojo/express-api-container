'use strict';
const crypto = require('crypto');
const passport = require('passport');
const {compact, get, isPlainObject, omit, partial} = require('lodash');

const constant = require('../constant');
const data = require('../data');
const json = require('../json');
const logger = require('../logger');

const {
	JWTAccessStrategy,
	JWTRefreshStrategy,
	LocalStrategy
} = require('./strategy');

const HASH_BYTES = 32;
const HASH_TYPE = 'sha256WithRSAEncryption';
const ITERATIONS = 20000;
const SALT_BYTES = 16;

const strategyConfig = {
	passReqToCallback: true
};


function errorHandler(request, done, error) {
	logger.error(`${constant.EXPRESS_HOST}.token.passport`, {error});
	done(error, false, request);
}

function failureHandler(request, done, failure) {
	logger.warn(`${constant.EXPRESS_HOST}.token.passport`, {failure});
	done(null, false, request);
}

function successHandler(request, done, success) {
	logger.info(`${constant.EXPRESS_HOST}.token.passport`, {success});
	done(null, success, request);
}


function jwtAccessVerify(request, payload, done) {
	logger.debug(`${constant.EXPRESS_HOST}.token.passport.jwt`, {verify: 'access'});
	const client = get(payload, 'sub');
	const user = get(payload, 'jai');
	if (isPlainObject(client) && isPlainObject(user)) {
		successHandler(request, done, user);
	} else {
		failureHandler(request, done, {
			message: 'malformed token',
			payload: json.string({client, user}),
			required: '{jai, sub}'
		});
	}
}

function jwtRefreshVerify(request, payload, done) {
	logger.info(`${constant.EXPRESS_HOST}.token.passport.jwt`, {verify: 'refresh'});
	const client = get(payload, 'sub');
	const user = get(payload, 'jri');
	if (isPlainObject(client) && isPlainObject(user)) {
		data.one('SELECT * FROM user WHERE id = $1', [user.id])
		.then(partial(successHandler, request, done))
		.catch(partial(errorHandler, request, done));
	} else {
		failureHandler(request, done, {message: 'malformed token payload', payload});
	}
}

function hash(password, salt, iterations) {
	return crypto.pbkdf2Sync(password, salt, iterations, HASH_BYTES, HASH_TYPE).toString('hex');
}

function localValidate(request, done, user, password, secret) {
	if (hash(password, secret.salt, +secret.iterations) === secret.hash) {
		successHandler(request, done, user);
	} else {
		failureHandler(request, done, {login: false, reason: 'password'});
	}
}

function localVerify(request, username, password, done) {
	logger.info(`${constant.EXPRESS_HOST}.token`, {verify: 'local', username});
	data.search('user', 'handle', username)
	.then(result => {
		const user = compact(result).pop();
		if (user) {
			data.get(`secret:${user.id}`)
			.then(partial(localValidate, request, done, user, password))
			.catch(partial(errorHandler, request, done));
		} else {
			failureHandler(request, done, {login: false, reason: 'username'});
		}
	})
	.catch(partial(errorHandler, request, done));
}


passport.use(new JWTAccessStrategy(strategyConfig, jwtAccessVerify));
passport.use(new JWTRefreshStrategy(strategyConfig, jwtRefreshVerify));
passport.use(new LocalStrategy(strategyConfig, localVerify));

module.exports = passport;
