'use strict';
const service = require('cluster');
const {performance} = require('perf_hooks');

const discover = require('./lib/discover');
const master = require('./lib/master');
const worker = require('./lib/worker')

const exitDelayMilliseconds = 100;


function deferredExit(code = 0, message) {
	setTimeout(() => {
		performance.mark(`kill:${process.pid}`);
		//console.log("\n", performance.getEntries());
		console.log("\n", `Exit code: ${code}`);
		process.exit(code);
	}, exitDelayMilliseconds);
}


performance.mark(`init:${process.pid}`);

const library = discover('./lib', true);

try {
	if (service.isMaster) {
		master(service, library);
	} else {
		worker(service, library);
	}
} catch (e) {
	console.log("\n", 'Something went horribly wrong....');
	console.log("\n", e.stack);
	deferredExit(1);
}
