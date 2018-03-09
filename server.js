'use strict';
const service = require('cluster');
const {find, partial} = require('lodash');

const constant = require('./lib/constant');
const json = require('./lib/json');
const logger = require('./lib/logger');
const network = require('./lib/network');
const worker = require('./worker')

const host = network().reduce((value, candidate) => {
	return candidate === '127.0.0.1' ? value : candidate;
}, null);

const config = {
	cores: constant.CPU_COUNT,
	host,
	port: constant.EXPRESS_PORT
};

const whitelist = ["code","connected","exitCode","id","killed","pid","process","state","writeQueueSize"];

let workers;

let namespace = `${constant.API_NAME}`;


function api(worker) {
	let members = Object.keys(worker);
	//logger.debug(`${namespace}.service.api`, json.string({members}));
	return members.reduce((object, member) => {
		let type = typeof worker[member];
		let value = {};
		if (whitelist.includes(member)) {
			switch (type) {
				case 'function':
					value[member] = `function ${member}(...) {...}`;
					break;
				case 'object':
					value[member] = (!!worker[member] || undefined)
						&& api(worker[member]);
					break;
				default: // 'boolean', 'number', 'string', 'undefined'
					value[member] = worker[member];
			}
		}
		return Object.assign(object, value);
	}, {});
}

function broadcast(message) {
	logger.debug(`${namespace}.service.broadcast`, json.string(message));
	return Object.values(service.workers).reduce((list, worker) => {
		list.push({
			id: worker.id,
			pid: worker.process.pid,
			result: worker.send(message)
		});
		return list;
	}, []);
}

function restart() {
	for (const id in service.workers) {
		worker.on('exit', () => {
			if (!worker.exitedAfterDisconnect) return;
			logger.info(`${namespace}.exit`, {pid:worker.process.pid, restart:true});
			service.fork({REPLACED_PROCESS:worker.process.pid});
		});
		worker.disconnect();
	}
}

function initializeService() {
	namespace = `${namespace}.service`;
	logger.info(`${namespace}.init`, config);
	logger.meta({master: process.pid});

	service.on('setup', settings =>
		logger.debug(`${namespace}.setup`, json.string(api(settings))));

	service.on('fork', worker =>
		logger.debug(`${namespace}.fork`, json.string(api(worker))));

	service.on('online', worker =>
		logger.debug(`${namespace}.online`, json.string(api(worker))));

	service.on('listening', (worker, address) =>
		logger.debug(`${namespace}.listening`,
			json.string(Object.assign({worker: worker.id}, address))));

	service.on('disconnect', worker =>
		logger.debug(`${namespace}.disconnect`, json.string(api(worker))));

	service.on('message', (worker, message) => {
		logger.info(`${namespace}.receive`, json.string(message));
	});

	service.on('exit', (worker, code, signal) => {
		logger.warn(`${namespace}.exit`, json.string(api(worker)));
		if (code !== 0 && !worker.exitedAfterDisconnect) {
			service.fork();
		}
	});

	process.on('SIGUSR2', () => {
		logger.info(`${namespace}.restart`, {signal: 'SIGUSR2'});
		restart();
	});

	for (let i = 0; i < constant.CPU_COUNT; i++) {
		service.fork();
	}
}


function randomKill() {
	const random = Math.random() * 10000;
	setTimeout(() => service.worker.kill(9), random);
}

function initializeWorker() {
	namespace = `${namespace}.worker-${service.worker.id}`;
	logger.meta({worker: process.pid});
	logger.debug(`${namespace}.init`, {pid: process.pid});

	service.worker.on('error', error => {
		logger.error(`${namespace}.error`, {failure: error.stack});
	});

	service.worker.on('exit', (code, signal) => {
		logger.warn(`${namespace}.exit`, json.string({code, signal}));
	});

	service.worker.on('message', message => {
		logger.info(`${namespace}.receive`, json.string(message));
	});

	worker(/*{...}*/);
}


if (service.isMaster) {
	initializeService();
} else {
	initializeWorker();
}
