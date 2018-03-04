'use strict';
const BearerStrategy = require('passport-http-bearer').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const Strategy = require('passport-strategy');
const moment = require('moment');
const util = require('util');
const {OAuth2Strategy} = require('passport-oauth');
const {pick} = require('lodash');

const constant = require('../constant');
const json = require('../json');
const logger = require('../logger');
const status = require('../status');

const decode = require('./decode');
const sign = require('./sign');
const validate = require('./validate');
const verify = require('./verify');

const namespace = `${constant.API_NAME}.token.strategy`;

const JWT_OPTIONS = [
	'algorithms',
	'audience',
	'issuer',
	'secretOrKey'
];

const JWT_ACCESS_PAYLOAD = [
	'sub',
	'user'
];

const JWT_REFRESH_PAYLOAD = [
	'sub',
	'auth'
];

const STRATEGY_OPTIONS = [
	'passReqToCallback'
];

function inspect(request) {
	const [scheme, token] = (request.get('authorization') || '').split(' ');
	const validated = validate(decode(token));
	const verified = verify(token);
	return {scheme, validated, verified};
}


class JWTAccessStrategy extends Strategy {

	constructor(options, verify) {
		super();
		Object.assign(this,
			pick(options, JWT_OPTIONS),
			pick(options, STRATEGY_OPTIONS),
			{name: 'jwt-access', verify}
		);
	}

	authenticate(request, options) {
		const {scheme, validated, verified} = inspect(request);
		logger.debug(`${namespace}.access`,
			{jwt: json.string({options, scheme, validated, verified})});
		if (!validated) {
			request.res.status(constant.HTTP_STATUS_BAD_REQUEST).send(status.badRequest);
		} else {
			if (!verified) {
				request.res.status(constant.HTTP_STATUS_UNAUTHORIZED).send(status.unauthorized);
			} else {
				if (this.passReqToCallback) {
					this.verify(request, pick(verified, JWT_ACCESS_PAYLOAD), this.done.bind(this));
				} else {
					this.verify(pick(verified, JWT_ACCESS_PAYLOAD), this.done.bind(this));
				}
			}
		}
	}

	done(error, payload, request) {
		if (error) {
			request
				? request.res.status(status.badRequest.code)
					.send(status.badRequest)
				: this.fail(status.badRequest.code);
		} else {
			if (!payload) {
				request
					? request.res.status(status.unauthorized.code)
						.send(status.unauthorized)
					: this.fail(status.unauthorized.code);
			} else {
				this.success(payload);
			}
		}
	}
}

util.inherits(JWTAccessStrategy, Strategy);


class JWTRefreshStrategy extends Strategy {

	constructor(options, verify) {
		super();
		Object.assign(this,
			pick(options, JWT_OPTIONS),
			pick(options, STRATEGY_OPTIONS),
			{name: 'jwt-refresh', verify}
		);
	}

	authenticate(request, options) {
		const {scheme, validated, verified} = inspect(request);
		logger.debug(`${namespace}.refresh`,
			{jwt: json.string({options, scheme, validated, verified})});
		if (!validated) {
			request.res.status(status.badRequest.code).send(status.badRequest);
		} else {
			if (!verified) {
				request.res.status(status.unauthorized.code).send(status.unauthorized);
			} else {
				if (this.passReqToCallback) {
					this.verify(request, pick(verified, JWT_REFRESH_PAYLOAD), this.done.bind(this));
				} else {
					this.verify(pick(verified, JWT_REFRESH_PAYLOAD), this.done.bind(this));
				}
			}
		}
	}

	done(error, payload, request) {
		if (error) {
			request
				? request.res.status(status.badRequest.code)
					.send(status.badRequest)
				: this.fail(status.badRequest.code);
		} else {
			if (!payload) {
				request
					? request.res.status(status.unauthorized.code)
						.send(status.unauthorized)
					: this.fail(status.unauthorized.code);
			} else {
				this.success(payload);
			}
		}
	}
}

util.inherits(JWTRefreshStrategy, Strategy);

module.exports = {
	BearerStrategy,
	JWTAccessStrategy,
	JWTRefreshStrategy,
	LocalStrategy,
	OAuth2Strategy
};
