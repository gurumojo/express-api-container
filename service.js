'use strict';
const bodyParser = require('body-parser');
const cores = require('os').cpus().length;
const readdir = require('fs').readdirSync;
const {get, partial} = require('lodash');

const constant = require('./library/constant');
const discover = require('./library/discover');
const json = require('./library/json');
const logger = require('./library/logger');
const network = require('./library/network');
const pubsub = require('./library/pubsub');
const router = require('./library/router');
const status = require('./library/status');
const {passport} = require('./library/token');

const namespace = `${constant.API_NAME}`;


function delegate(channel, message) {
	const object = json.object(message);
	if (get(object, 'error')) {
		logger.error(`${namespace}.delegate`, error);
	}
	if (!get(object, 'subscribe')) {
		logger.info(`${namespace}.delegate`, object);
	}
}

function derelict(request, response) {
	response.status(constant.HTTP_STATUS_METHOD_NOT_ALLOWED).send(status.methodNotAllowed);
}

function guard(route) {
	return route.secure
	  ? passport.authenticate('jwt-access', {session: false})
	  : (request, response, next) => next();
}


const service = router();

service.use(passport.initialize());

discover(`${__dirname}/middleware`)
.forEach(middleware => service.use(require(middleware.module)));

discover(`${__dirname}/route`)
.forEach(route => service.use(`/${route.name}`, guard(route), require(route.module)));

service.use('/', guard({secure: true}), derelict);

service.listen(constant.EXPRESS_PORT, () => {
	logger.info(`${namespace}.listen`, {
		host: json.string(network()),
		port: constant.EXPRESS_PORT
	});
	pubsub.subscribe(namespace, delegate);
});
