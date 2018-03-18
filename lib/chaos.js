'use strict';
const {get, find, partial, pick} = require('lodash');

const {performance} = require('perf_hooks');

const cache = {};
let dataLocal, jsonLocal, loggerLocal, namespace, MIN_TIMEOUT, MAX_TIMEOUT;


function random(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function timeout(worker) {
	function killer() {
		const label = `${namespace}.kill`;
		const id = worker.id;
		loggerLocal.debug(label, {id});
		performance.mark(`${label}:${id}`);
		throw new TypeError('CHAOS');
	}
	return setTimeout(killer, random(MIN_TIMEOUT, MAX_TIMEOUT));
}

function cancel(list, id) {
	const label = `${namespace}.clear`;
	loggerLocal.debug(label, {id});
	performance.mark(`${label}:${id}:${list[id]}`);
	clearTimeout(list[id]);
	delete list[id];
	return list;
}

function initializeChaos(worker, library) {
	const id = worker.id;
	const {
		constant: {API_NAME, CHAOS_TIMEOUT_MIN_MS, CHAOS_TIMEOUT_MAX_MS},
		data, json, logger
	} = library;
	if (+CHAOS_TIMEOUT_MAX_MS) {
		dataLocal = data;
		jsonLocal = json;
		loggerLocal = logger;
		MIN_TIMEOUT = +CHAOS_TIMEOUT_MIN_MS;
		MAX_TIMEOUT = +CHAOS_TIMEOUT_MAX_MS;
		namespace = `${API_NAME}.chaos`;
		performance.mark(`${namespace}.init:${id}`);
		cache[id] = timeout(worker);
	} else {
		logger.debug(`${namespace}.skip`,
			{max: CHAOS_TIMEOUT_MAX_MS, min: CHAOS_TIMEOUT_MIN_MS});
		performance.mark(`${namespace}.skip:${id}`);
	}
}

function stopTheMadness() {
	const label = `${namespace}.halt`;
	const pid = process.pid;
	loggerLocal.debug(label, {pid});
	performance.mark(`${label}:${pid}`);
	Object.keys(cache).reduce(cancel, cache);
}


module.exports = {
	halt: stopTheMadness,
	init: initializeChaos
};
