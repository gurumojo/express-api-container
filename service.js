'use strict';
const bodyParser = require('body-parser');
const {get, partial} = require('lodash');

const constant = require('./lib/constant');
const discover = require('./lib/discover');
const json = require('./lib/json');
const logger = require('./lib/logger');
const network = require('./lib/network');
//const pubsub = require('./lib/pubsub');
const router = require('./lib/router');
const status = require('./lib/status');
const {passport} = require('./lib/token');

const host = network().reduce((value, candidate) => {
	return candidate === '127.0.0.1' ? value : candidate;
}, null);

const namespace = `${constant.API_NAME}`;


function catchall(request, response) {
	response.status(constant.HTTP_STATUS_METHOD_NOT_ALLOWED).send(status.methodNotAllowed);
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


const service = router();

service.use(passport.initialize());

discover(`${__dirname}/middleware`)
.forEach(middleware => service.use(require(middleware.module)));

discover(`${__dirname}/route`)
.forEach(route => service.use(`/${route.name}`, guard(route), require(route.module)));

service.use('/', guard({secure: true}), catchall);

//Array(constant.CPU_COUNT).fill(null, 0, constant.CPU_COUNT)
//.map((x, i) => {
//	const port = i + constant.EXPRESS_PORT;
	const port = constant.EXPRESS_PORT;
	service.listen(port, () => {
		logger.info(`${namespace}.listen`, {host, port});
	})
//});

//pubsub.subscribe(namespace, delegate);
