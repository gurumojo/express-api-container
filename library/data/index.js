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


function deferredExit(code) {
	setTimeout(() => {
		process.exit(code);
	}, exitDelayMilliseconds);
}

function init() {
	return postgres.bootstrap(pgOptions, dbOptions)
	.then(() => postgres.connect(dbOptions))
	.then(pg => Object.assign(facade(pg), {
		release: () => postgres.release(pg),
		status: () => postgres.status(pg)
	}))
	.catch(e => {
		deferredExit(1);
	});
}


module.exports = init();
