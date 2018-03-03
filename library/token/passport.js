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

const HASH_ITERATIONS = 100000;
const HASH_BYTES = 64;
const HASH_TYPE = 'sha512';

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
	logger.info(`${namespace}.access`, {verify: sub});
	if (isUUID(sub) && isPlainObject(user)) {
		successHandler(request, done, sub);
	} else {
		failureHandler(request, done, {
			message: 'malformed access token payload',
			payload: json.string({sub, user}),
			required: '{sub: <String>, user: <Object>}'
		});
	}
}


function jwtRefreshVerify(request, payload, done) {
	const sub = get(payload, 'sub');
	const auth = get(payload, 'auth');
	logger.info(`${namespace}.refresh`, {verify: sub});
	if (isUUID(sub) && isPlainObject(auth)) {
		data.one(data.query.getToken, {sub})
		.then(token => {
			let entity = {uuid: sub};
			request.res.locals.token = generate(entity, auth.user);
			return localCache(request, done, entity);
		})
		.catch(partial(errorHandler, request, done));
	} else {
		failureHandler(request, done, {
			message: 'malformed refresh token payload',
			payload: json.string({sub, auth}),
			required: '{sub: <String>, auth: <Object>}'
		});
	}
}


function hash(secret, salt) {
	return crypto.pbkdf2Sync(secret, salt, HASH_ITERATIONS, HASH_BYTES, HASH_TYPE).toString('hex');
}

function generate(entity, payload) {
	let auth = objectFromRow(payload);
	let token = {
		access: sign({sub: entity.uuid, user: auth.user}),
		refresh: sign({sub: entity.uuid, auth})
	};
	return token;
}

function objectFromRow(payload) {
	logger.debug(`${namespace}.transform`, payload);
	return {user: payload};
}

function localCache(request, done, entity) {
	return data.none(data.query.putToken, {
		sub: entity.uuid, refresh: request.res.locals.token.refresh
	})
	.then(result => {
		successHandler(request, done, entity.uuid);
	});
}

function localValidate(request, done, result) {
	let [entity, cipher, payload] = result;
	if (entity.cipher === cipher) {
		request.res.locals.token = generate(entity, payload);
		return localCache(request, done, entity);
	} else {
		failureHandler(request, done, {login: false, reason: 'password'});
	}
}

function localVerify(request, username, password, done) {
	logger.info(`${namespace}.local`, {verify: username});
	data.one(data.query.getCredential, {uuid: username})
	.then(entity => {
		return Promise.all([
			entity,
			hash(password, entity.salt),
			data.one(data.query.getAuth, {entity: entity.id})
		])
		.then(partial(localValidate, request, done));
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
