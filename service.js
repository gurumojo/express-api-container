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
const {passport} = require('./library/token');


function defaultRoute(request, response) {
	response.status(constant.HTTP_STATUS_METHOD_NOT_ALLOWED);
	response.send({
		error: {
			code: constant.HTTP_STATUS_METHOD_NOT_ALLOWED,
			description: 'The requested method is not allowed for this route.',
			message: 'METHOD_NOT_ALLOWED'
		}
	});
}

function delegate(channel, message) {
	const object = json.object(message);
	if (get(object, 'error')) {
		logger.error(`${constant.EXPRESS_HOST}.delegate`, error);
	}
	if (!get(object, 'subscribe')) {
		logger.info(`${constant.EXPRESS_HOST}.delegate`, object);
	}
}


const service = router();

service.use(passport.initialize());

discover(`${__dirname}/middleware`)
.forEach(middleware => service.use(require(middleware.module)));

discover(`${__dirname}/route`)
.forEach(route => service.use(`/${route.name}`, require(route.module)));

service.use('/', passport.authenticate('jwt-access', {session: false}), defaultRoute);

service.listen(constant.EXPRESS_PORT, () => {
	logger.info(`${constant.EXPRESS_HOST}.listen`, {
		host: json.string(network()),
		port: constant.EXPRESS_PORT
	});
	pubsub.subscribe(constant.EXPRESS_HOST, delegate);
});
