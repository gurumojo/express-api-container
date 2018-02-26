'use strict';
const postgres = require('./postgres');
const facade = require('./facade');

const {
	POSTGRES_HOST,
	POSTGRES_PORT,
	POSTGRES_DB,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_API_DB,
	POSTGRES_API_USER,
	POSTGRES_API_PASSWORD
} = require('../constant');

const dbOptions = {
	host: POSTGRES_HOST,
	port: POSTGRES_PORT,
	database: POSTGRES_API_DB,
	user: POSTGRES_API_USER,
	password: POSTGRES_API_PASSWORD
};

const pgOptions = {
	host: POSTGRES_HOST,
	port: POSTGRES_PORT,
	database: POSTGRES_DB,
	user: POSTGRES_USER,
	password: POSTGRES_PASSWORD
};

const exitDelayMilliseconds = 100;

const api = {
	any: null,
	many: null,
	map: null,
	maybe: null,
	none: null,
	one: null,
	query: null,
	release: null,
	status: null
};


function deferredExit(code) {
	setTimeout(() => {
		process.exit(code);
	}, exitDelayMilliseconds);
}

function enableAPI(pg) {
	Object.assign(api, facade(pg), {
		release: () => {postgres.release(pg); Object.keys(api).reduce(purge, api)},
		status: () => postgres.status(pg)
	});
}

function init() {
	return postgres.bootstrap(pgOptions, dbOptions)
	.then(() => postgres.connect(dbOptions))
	.then(enableAPI)
	.catch(e => {
		deferredExit(1);
	});
}

function purge(target, member) {
	delete target[member];
	return target;
}


init();

module.exports = api;
