'use strict';
const bodyParser = require('body-parser');
const {get, omit, partial} = require('lodash');

const {performance} = require('perf_hooks');


function initializeWorker(service, library) {

	const {
		constant: {API_NAME, EXPRESS_PORT}, token: {passport},
		chaos, json, logger, middleware, network, route, status
	} = library;

	const RBAC = Object.keys(library.constant).reduce((o, x) => {
		const name = x.slice(0, 1)
		if (name !== name.toUpperCase()) {
			o[x] = library.constant[x];
		}
		return o;
	}, {});

	const namespace = `${API_NAME}.worker`;


	function catchall(request, response) {
		response.template.methodNotAllowed.dispatch(response);
	}

	function guard(endpoint) {
		const ruleset = RBAC[endpoint];
		return ruleset
			? passport.authenticate('jwt-access')
			: (request, response, next) => next();
	}


	performance.mark(`${namespace}.init:${process.pid}`);

	logger.debug(`${namespace}.init`, {pid: process.pid});
	logger.meta({worker: process.pid});

	service.worker.on('error', error => {
		logger.error(`${namespace}.error`, {failure: error.stack});
	});

	service.worker.on('exit', (code, signal) => {
		logger.warn(`${namespace}.exit`, json.string({code, signal}));
	});

	service.worker.on('message', message => {
		logger.info(`${namespace}.receive`, json.string(message));
	});

	const port = EXPRESS_PORT || env.port;
	const http = route.factory();

	http.use(passport.initialize());

	Object.keys(middleware).forEach(name =>
		http.use(middleware[name]));

	Object.keys(omit(route, 'factory', 'handler')).forEach(name =>
		http.use(`/${name}`, guard(name), route[name]));

	http.use('/', guard('*'), catchall);

	http.listen(port, () => {
		logger.info(`${namespace}.listen`, {port});
	});

	chaos.init(service.worker, library);
}


module.exports = initializeWorker;
