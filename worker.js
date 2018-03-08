'use strict';
const bodyParser = require('body-parser');
const {get, partial} = require('lodash');

const constant = require('./lib/constant');
const discover = require('./lib/discover');
const json = require('./lib/json');
const logger = require('./lib/logger');
//const pubsub = require('./lib/pubsub');
const router = require('./lib/router');
const status = require('./lib/status');
const {passport} = require('./lib/token');

const namespace = `${constant.API_NAME}`;


function catchall(request, response) {
	response
		.status(constant.HTTP_STATUS_METHOD_NOT_ALLOWED)
		.send(status.methodNotAllowed);
}

function delegate(channel, message) {
	const object = json.object(message);
	if (get(object, 'error')) {
		logger.error(`${channel}.delegate`, error);
	}
	if (!get(object, 'subscribe')) {
		logger.info(`${channel}.delegate`, object);
	}
}

function guard(route) {
	return route.secure
		? passport.authenticate('jwt-access')
		: (request, response, next) => next();
}

function worker(env = {}) {
	const port = constant.EXPRESS_PORT || env.port;
	const http = router();

	http.use(passport.initialize());

	discover(`${__dirname}/middleware`).forEach(middleware =>
		http.use(require(middleware.module)));

	discover(`${__dirname}/route`).forEach(route =>
		http.use(`/${route.name}`, guard(route), require(route.module)));

	http.use('/', guard({secure: true}), catchall);

	http.listen(port, () => {
		logger.info(`${namespace}.listen`, {port});
	});
	//pubsub.subscribe(namespace, delegate);
}


module.exports = worker;
