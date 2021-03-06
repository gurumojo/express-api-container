'use strict';
const {get, find, partial, pick} = require('lodash');

const {performance} = require('perf_hooks');


function initializeMaster(service, library) {

	const {
		constant: {API_NAME, CPU_COUNT},
		data, json, logger, network, pubsub
	} = library;

	const namespace = `${API_NAME}.service`;


	function broadcast(message) {
		logger.debug(`${namespace}.broadcast`, json.string(message));
		return Object.values(service.workers).reduce((list, worker) => {
			list.push({
				id: worker.id,
				pid: worker.process.pid,
				result: worker.send(message)
			});
			return list;
		}, []);
	}

	function delegate(channel, message) {
		const object = json.object(message);
		if (get(object, 'error')) {
			logger.error(`${channel}.delegate`, error);
		}
		if (!get(object, 'subscribe')) {
			logger.info(`${channel}.delegate`, object);
			handler[object.event](object.payload);
		}
	}

	function shutdown(restart = false) {
		return Object.values(service.workers).reduce((list, worker) => {
			worker.on('exit', (code, signal) => {
				performance.mark(`${namespace}.exit:${worker.pid}`);
				if (!worker.exitedAfterDisconnect) {
					logger.warn(`${namespace}.fail`, {pid:worker.process.pid, code, signal});
					return;
				}
				logger.info(`${namespace}.exit`, {pid:worker.process.pid, restart});
				service.fork({REPLACED_PROCESS:worker.process.pid});
			});
			list.push(worker.disconnect());
			return list;
		}, []);
	}

	performance.mark(`${namespace}.init:${process.pid}`);

	logger.info(`${namespace}.init`, {pid: process.pid});
	logger.meta({master: process.pid});

	service.on('setup', settings =>
		logger.debug(`${namespace}.setup`, json.string(settings)));

	service.on('fork', worker =>
		logger.debug(`${namespace}.fork`, pick(worker, ['id', 'pid'])));

	service.on('online', worker =>
		logger.debug(`${namespace}.online`,  pick(worker, ['id', 'pid'])));

	service.on('listening', (worker, address) => {
		logger.debug(`${namespace}.listening`, Object.assign({worker: worker.id}, address));
	});

	service.on('disconnect', worker =>
		logger.debug(`${namespace}.disconnect`,  pick(worker, ['id', 'pid'])));

	service.on('message', (worker, message) => {
		logger.info(`${namespace}.receive`, json.string(message));
	});

	service.on('exit', (worker, code, signal) => {
		logger.warn(`${namespace}.exit`,  {code, signal, worker: pick(worker, ['id', 'pid'])});
		if (code !== 0 && !worker.exitedAfterDisconnect) {
			service.fork();
		}
	});

	process.on('SIGUSR2', () => {
		logger.info(`${namespace}.restart`, {signal: 'SIGUSR2'});
		shutdown(true);
	});

	data.connect(logger, `${API_NAME}.data`).then(() => {
		performance.mark(`${namespace}.data:${process.pid}`);
		pubsub.subscribe(API_NAME, delegate);
		let i = 1;
		if (i === CPU_COUNT) {
			logger.warn(`${namespace}.resource`,  {cpu: i});
			service.fork();
		} else {
			while (i < CPU_COUNT) {
				service.fork();
				i++;
			}
		}
	});
}


module.exports = initializeMaster;
