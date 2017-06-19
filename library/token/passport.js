'use strict';
const BearerStrategy = require('passport-http-bearer').Strategy;
const JWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const crypto = require('crypto');
const passport = require('passport');
const {compact, get, omit, partial} = require('lodash');

const constant = require('../constant');
const data = require('../data');
const logger = require('../logger');

const SALT_BYTES = 16;
const HASH_BYTES = 32;
const ITERATIONS = 20000;

const bearerConfig = {
	passReqToCallback: true
};

const jwtConfig = {
	algorithms: [constant.JWT_ALGORITHM],
	audience: constant.JWT_AUDIENCE,
	issuer: constant.JWT_ISSUER,
	jwtFromRequest: JWT.ExtractJwt.fromAuthHeader(),
	passReqToCallback: true,
	secretOrKey: constant.JWT_SECRET
};

const localConfig = {
	passReqToCallback: true
};

const oauthConfig = {
	authorizationURL: constant.OAUTH_URL_AUTHORIZE,
	callbackURL: constant.OAUTH_URL_CALLBACK,
	clientID: constant.OAUTH_CLIENT_ID,
	clientSecret: constant.OAUTH_CLIENT_SECRET,
	passReqToCallback: true,
	tokenURL: constant.OAUTH_URL_TOKEN
};


function errorHandler(request, done, error) {
	logger.error(`${constant.EXPRESS_HOST}.token`, {error});
	logger.debug(`${constant.EXPRESS_HOST}.token`, request.res.locals);
	done(error, false);
}

function failureHandler(request, done, failure) {
	logger.warn(`${constant.EXPRESS_HOST}.token`, {failure});
	logger.debug(`${constant.EXPRESS_HOST}.token`, request.res.locals);
	done(null, false);
}

function successHandler(request, done, success) {
	logger.info(`${constant.EXPRESS_HOST}.token`, {success});
	done(null, success);
}


function bearerVerify(request, token, done) {
	logger.info(`${constant.EXPRESS_HOST}.token`, {verify: 'bearer', token});
	done(null, {token});
}

function jwtVerify(request, token, done) {
	logger.info(`${constant.EXPRESS_HOST}.token`, {verify: 'jwt', token});
	done();
}

function hash(password, salt, iterations) {
	// see https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/
	return crypto.pbkdf2Sync(password, salt, iterations, HASH_BYTES, 'sha256WithRSAEncryption').toString('hex');
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

function oauthVerify(request, accessToken, refreshToken, profile, done) {
	logger.info(`${constant.EXPRESS_HOST}.token`, {verify: 'oauth', profile});
	done(null, {accessToken, refreshToken, profile});
}


function serialize(user, done) {
	done(null, get(user, 'id'));
}

function deserialize(id, done) {
	data.get(`user:${id}`)
	.then(user => done(null, user));
}

passport.use(new JWT.Strategy(jwtConfig, jwtVerify));
passport.use(new LocalStrategy(localConfig, localVerify));
passport.use(new BearerStrategy(bearerConfig, bearerVerify));
passport.use(new OAuth2Strategy(oauthConfig, oauthVerify));

passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

module.exports = passport;
