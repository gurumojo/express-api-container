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

const decode = require('./decode');
const sign = require('./sign');
const validate = require('./validate');
const verify = require('./verify');

const badRequest = {
	error: {
		code: constant.HTTP_STATUS_BAD_REQUEST,
		description: 'The request was malformed. Consult API documentation for help.',
		message: 'BAD_REQUEST'
	}
};

const unauthorized = {
	error: {
		code: constant.HTTP_STATUS_UNAUTHORIZED,
		description: 'This request was blocked for insufficient authority.',
		message: 'UNAUTHORIZED'
	}
};

const JWT_OPTIONS = [
	'algorithms',
	'audience',
	'issuer',
	'secretOrKey'
];

const JWT_PAYLOAD = [
	'jai',
	'jri',
	'sub'
];

const STRATEGY_OPTIONS = [
	'passReqToCallback'
];

function inspect(request) {
	const [scheme, token] = (request.get('authorization') || '').split(' ');
	const validated = validate(decode(token), {complete: true});
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
		logger.debug(`${constant.EXPRESS_HOST}.token.strategy.access`,
			{jwt: json.string({options, scheme, validated, verified})});
		if (!validated) {
			request.res.status(constant.HTTP_STATUS_BAD_REQUEST).send(badRequest);
		} else {
			if (!verified) {
				request.res.status(constant.HTTP_STATUS_UNAUTHORIZED).send(unauthorized);
			} else {
				if (this.passReqToCallback) {
					this.verify(request, pick(verified, JWT_PAYLOAD), this.done.bind(this));
				} else {
					this.verify(pick(verified, JWT_PAYLOAD), this.done.bind(this));
				}
			}
		}
	}

	done(error, payload, request) {
		if (error) {
			request ? request.res.status(constant.HTTP_STATUS_BAD_REQUEST).send(badRequest)
				: this.fail(constant.HTTP_STATUS_BAD_REQUEST);
		} else {
			if (!payload) {
				request ? request.res.status(constant.HTTP_STATUS_UNAUTHORIZED).send(unauthorized)
					: this.fail(constant.HTTP_STATUS_UNAUTHORIZED);
			} else {
				this.success(payload);
			}
		}
	}
}

util.inherits(JWTAccessStrategy, Strategy);


class JWTRefreshStrategy extends Strategy {

	constructor(options, done) {
		super();
		Object.assign(this,
			pick(options, JWT_OPTIONS),
			pick(options, STRATEGY_OPTIONS),
			{done, name: 'jwt-refresh'}
		);
	}

	authenticate(request, options) {
		const {scheme, validated, verified} = inspect(request);
		logger.debug(`${constant.EXPRESS_HOST}.token.refresh`,
			{options, scheme, validated, verified});
		if (validated && verified) {
			const refresh = moment().add(constant.JWT_REFRESH_RANGE, constant.JWT_REFRESH_UNIT);
			if (moment(verified.payload.exp * 1000).isBefore(refresh)) {
				request.res.locals.token = {
					access: sign(),
					refresh: sign(verified.payload.sub)
				};
				request.set('x-refresh-token', signed);
			}
		} else {
			this.fail(constant.HTTP_STATUS_UNAUTHORIZED);
		}
	}
}

module.exports = {
	BearerStrategy,
	JWTAccessStrategy,
	JWTRefreshStrategy,
	LocalStrategy,
	OAuth2Strategy
};
