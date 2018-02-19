'use strict';
const crypto = require('crypto');
const passport = require('passport');
const {compact, get, isPlainObject, omit, partial} = require('lodash');

const data = require('../data');
const json = require('../json');
const logger = require('../logger');
const {API_NAME} = require('../constant');

const sign = require('./sign');
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
	passReqToCallback: true,
	session: false
};

const namespace = `${API_NAME}.token.passport`;


function errorHandler(request, done, error) {
	logger.error(namespace, {error: error.stack});
	done(error, false, request);
}

function failureHandler(request, done, failure) {
	logger.warn(namespace, {failure});
	done(null, false, request);
}

function successHandler(request, done, success) {
	logger.info(namespace, {success});
	done(null, success, request);
}

function isUUID(value) {
	return /^(?:[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i.test(value);
}


function jwtAccessVerify(request, payload, done) {
	const sub = get(payload, 'sub');
	const user = get(payload, 'user');
	logger.debug(`${namespace}.jwt.access`, {verify: sub});
	if (isUUID(sub) && isPlainObject(user)) {
		successHandler(request, done, user);
	} else {
		failureHandler(request, done, {
			message: 'malformed access token payload',
			payload: json.string({sub, user}),
			required: '{sub: <String>, user: <Object>}'
		});
	}
}

const refreshReadSQL = 'SELECT * FROM user WHERE id = $1 AND uuid = $2';

function jwtRefreshVerify(request, payload, done) {
	const sub = get(payload, 'sub');
	const auth = get(payload, 'auth');
	logger.info(`${namespace}.jwt.refresh`, {verify: sub});
	if (isUUID(sub) && isPlainObject(auth)) {
		//data.one(refreshReadSQL, [auth.user.id, sub])
		Promise.resolve(auth)
		.then(xxx => {
			request.res.locals.token = {
				access: sign({sub, user: auth.user}),
				refresh: sign({sub, auth})
			}
			return xxx;
		})
		.then(partial(successHandler, request, done))
		.catch(partial(errorHandler, request, done));
	} else {
		failureHandler(request, done, {
			message: 'malformed refresh token payload',
			payload: json.string({sub, auth}),
			required: '{sub: <String>, auth: <Object>}'
		});
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
	logger.info(`${namespace}.local`, {verify: 'local', username});
	data.one(data.query.getEntity, {uuid: username})
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


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.use(new JWTAccessStrategy(strategyConfig, jwtAccessVerify));
passport.use(new JWTRefreshStrategy(strategyConfig, jwtRefreshVerify));
passport.use(new LocalStrategy(strategyConfig, localVerify));

module.exports = passport;
