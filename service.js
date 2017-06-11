'use strict';
const init = Date.now();

const bodyParser = require('body-parser');
const express = require('express');
const expressSession = require('express-session');
const flash = require('connect-flash');
const process = require('process');
const readdir = require('fs').readdirSync;
const RedisStore = require('connect-redis')(expressSession)
const {get, isString, partial, pick} = require('lodash');

const constant = require('./library/constant');
const json = require('./library/json');
const logger = require('./library/logger');
const network = require('./library/network');
const passport = require('./library/session');
const pubsub = require('./library/pubsub');

const EXPRESS_HOST = process.env.EXPRESS_HOST || constant.EXPRESS_HOST;
const EXPRESS_PORT = process.env.EXPRESS_PORT || constant.EXPRESS_PORT;
const NODE_ENV = process.env.NODE_ENV;
const REDIS_HOST = process.env.REDIS_HOST || constant.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT || constant.REDIS_PORT;
const SESSION_SECRET = process.env.SESSION_SECRET || constant.SESSION_SECRET;

const error404 = {
	error: {
		code: constant.HTTP_STATUS_NOT_FOUND,
		message: 'NOT_FOUND'
	}
};


function delegate(channel, message) {
	const object = json.object(message);
	if (get(object, 'error')) {
		logger.error(`${EXPRESS_HOST}.delegate`, error);
	}
	if (!get(object, 'subscribe')) {
		logger.info(`${EXPRESS_HOST}.delegate`, object);
		logger.warn(`${EXPRESS_HOST}.${object.method}`, {pending: 'message delegation'});
	}
}

function discover(type, array, value) {
	if (value.indexOf('.') !== 0) {
		const name = value.split('.')[0];
		logger.info(`${EXPRESS_HOST}.discover`, {type, name});
		array.push({
			module: require(`./${type}/${value}`),
			name,
			type
		});
	}
	return array;
}

function dispatch(level, flash) {
	flash.forEach(message =>
		logger[level](`${EXPRESS_HOST}.message`, message)
	);
}

function message(request, response, next) {
	Object.keys(logger).forEach(method => {
		response.locals[method] = request.flash(method);
	});
    next();
}

function requestLogger(request, response, next) {
	Object.keys(logger).forEach(method => {
		if (response.locals[method].length) {
			dispatch(method, response.locals[method]);
		}
	});
	const method = isStatusRoute(request) ? 'debug' : 'info';
	logger[method](`${EXPRESS_HOST}.request`, Object.assign(
		pick(request, constant.LOGGER_WHITELIST_EXPRESS_REQUEST),
		{body: JSON.stringify(request.body)}
	));
	next();
}

function isStatusRoute(request) {
	return (request.path === '/status' || request.baseUrl === '/status');
}

function responseLogger(request, response, next) {
	const send = response.send;
	let called = false;
	response.send = body => {
		send.apply(response, [body]);
		if (!called) {
			called = true;
			let method = 'info';
			if (response.statusCode >= 500) {
				method = 'error';
			} else if (response.statusCode >= 400) {
				method = 'warn';
			}
			if (isStatusRoute(request)) {
				method = 'debug';
			}
			logger[method](`${EXPRESS_HOST}.response`, Object.assign(
				{sessionID: request.sessionID},
				pick(response, constant.LOGGER_WHITELIST_EXPRESS_RESPONSE),
				{body}
			));
		}
	};
	next();
}


logger.info(`${EXPRESS_HOST}.init`, {timestamp: init});

const service = express();

service.disable('etag');
service.disable('x-powered-by');

service.use(bodyParser.json());

service.use(flash());

service.use(expressSession({
	resave: false,
	saveUninitialized: false,
	secret: SESSION_SECRET,
	store: new RedisStore({
		host: REDIS_HOST,
		port: REDIS_PORT,
		prefix: 'session:',
		ttl: 3600
	})
}));

service.use(passport.initialize());
service.use(passport.session());

service.use(message);
service.use(requestLogger);
service.use(responseLogger);

readdir(`${__dirname}/middleware`)
.reduce(partial(discover, 'middleware'),  [])
.forEach(middleware => service.use(middleware.module));

readdir(`${__dirname}/route`)
.reduce(partial(discover, 'route'), [])
.forEach(route => service.use(`/${route.name}`, route.module));

service.use('/', (request, response) => {
	response.status(constant.HTTP_STATUS_NOT_FOUND);
	response.send(error404);
});

service.listen(EXPRESS_PORT, () => {
	logger.info(`${EXPRESS_HOST}.listen`, {
		host: JSON.stringify(network()), 
		port: EXPRESS_PORT
	});
	pubsub.subscribe(EXPRESS_HOST, delegate);
});
