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

const api = {
	any: null,
	connect,
	many: null,
	map: null,
	maybe: null,
	none: null,
	one: null,
	query: null,
	release: null,
	status: null
};


function connect(logger, namespace) {
	return postgres.bootstrap(pgOptions, dbOptions)
	.then(() => postgres.connect(dbOptions))
	.then(enableAPI)
	.then(() => logger.info(`${namespace}.postgres`, {host: POSTGRES_HOST, port: POSTGRES_PORT}));
}

function enableAPI(pg) {
	Object.assign(api, facade(pg), {
		release: () => {postgres.release(pg); Object.keys(api).reduce(purge, api)},
		status: () => postgres.status(pg)
	});
}

function purge(target, member) {
	if (member !== 'connect') {
		target[member] = null;
	}
	return target;
}


module.exports = api;
