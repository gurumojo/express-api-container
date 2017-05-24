'use strict';
const init = Date.now();

const bodyParser = require('body-parser');
const express = require('express');
const expressSession = require('express-session');
const flash = require('connect-flash');
const hostname = require('os').hostname();
const process = require('process');
const readdir = require('fs').readdirSync;
const RedisStore = require('connect-redis')(expressSession)
const {get, includes, partial, pick} = require('lodash');

const json = require('./library/json');
const logger = require('./library/logger');
const passport = require('./library/session');
const pubsub = require('./library/pubsub');

const EXPRESS_HOST = process.env.EXPRESS_HOST || 'api';
const EXPRESS_PORT = process.env.EXPRESS_PORT || 8000;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const DISCOVERY_BLACKLIST = ['Dockerfile', 'node_modules'];
const REQUEST_WHITELIST = ['method', 'path', 'query', 'body', 'headers', 'sessionID'];
const RESPONSE_WHITELIST = ['headers', 'statusCode'];
const SESSION_SECRET = process.env.SESSION_SECRET || 'y0uRbl00Dt4st3Slik3$yruP';

const error404 = {
	code: 404,
	message: 'NOT_FOUND'
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
	if (!includes(DISCOVERY_BLACKLIST, value) && value.indexOf('.') !== 0) {
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
	const method = request.path === '/status' ? 'debug' : 'info';
	logger[method](`${EXPRESS_HOST}.request`, pick(request, REQUEST_WHITELIST));
	next();
}

function responseLogger(request, response, next) {
	const send = response.send;
	let called = false;
	response.send = payload => {
		send.apply(response, [payload]);
		if (!called) {
			called = true;
			const method = request.baseUrl === '/status' ? 'debug' : 'info';
			logger[method](`${EXPRESS_HOST}.response`, Object.assign(
				pick(response, RESPONSE_WHITELIST),
				{body: JSON.parse(payload)},
				pick(request, 'sessionID')
			));
		}
	};
	next();
}

function sessionLogger(request, response, next) {
	logger.debug(`${EXPRESS_HOST}.session`, request.session);
	next();
}


logger.info(`${EXPRESS_HOST}.init`, {timestamp: init, container: hostname});

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
service.use(sessionLogger);

readdir(`${__dirname}/middleware`)
.reduce(partial(discover, 'middleware'),  [])
.forEach(middleware => service.use(middleware.module));

readdir(`${__dirname}/route`)
.reduce(partial(discover, 'route'), [])
.forEach(route => service.use(`/${route.name}`, route.module));

service.use('/', (request, response) => {
	response.status(404);
	response.send(error404);
});

service.listen(EXPRESS_PORT, () => {
	logger.info(`${EXPRESS_HOST}.listen`, {
		timestamp: Date.now(),
		uri: `http://${hostname}:${EXPRESS_PORT}/`
	});
	pubsub.subscribe(EXPRESS_HOST, delegate);
});
