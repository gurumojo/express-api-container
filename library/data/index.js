'use strict';
const Promise = require('bluebird');
const postgres = require('pg-promise');
const process = require('process');

const constant = require('../constant');
const json = require('../json');
const logger = require('../logger');

const host = constant.POSTGRES_HOST;
const port = constant.POSTGRES_PORT;
const database = constant.POSTGRES_DB;
const user = constant.POSTGRES_USER;
const password = constant.POSTGRES_PASSWORD;

const options = {
	capSQL: true,
	//connect: _notify,
	promiseLib: Promise,
	//receive: _camelize
};

const sql = {
	createDatabase: (database) => `CREATE DATABASE ${database}`,
	search: (table, column, value) => `SELECT * FROM ${table}
		WHERE ${column} LIKE '%${value}%'`,
	showDatabases: () => 'SELECT datname FROM pg_database',
	showTables: () => `SELECT * FROM pg_catalog.pg_tables
		WHERE schemaname NOT IN ('pg_catalog', 'information_schema')`
};
//return new postgres.ParameterizedQuery(`SELECT * FROM ${table} WHERE ${column} LIKE $1`)

let db = null;
let pool = null;


function _camelize(data) {
	const tmp = data[0];
	for (let prop in tmp) {
		const camel = postgres.utils.camelizeVar(prop);
		if (!(camel in tmp)) {
			for (let i = 0; i < data.length; i++) {
				const d = data[i];
				d[camel] = d[prop];
				delete d[prop];
			}
		}
	}
}

function _fail() {
	return Promise.reject(new Error('no database connection'));
}

function _notify(client, context, fresh) {
	if (fresh) {
		logger.debug('data.notify', {context, fresh, client});
		namespace();
	}
}


function any(query, input) {
	logger.debug('data.any', {query, input: json.string(input)});
	return !db ? _fail() : db.any(query, input)
	.tap(o => logger.debug('data.any', {result: json.string(o)}))
	.catch(e => logger.error('data.any', {error: e.stack}));
}

function connect() {
	logger.info('data.postgres', {host, port});
	pool = postgres(options);
	db = pool({host, port, user, password, database});
}

function create(database) {
	logger.info('data.create', {database});
	return !db ? _fail() : db.none(sql.createDatabase(database))
	.tap(x => logger.debug('data.create.result', {success: !x}))
	.catch(e => logger.error('data.namespace', {error: e.stack}));
}

function many(query, input) {
	logger.debug('data.many', {query, input: json.string(input)});
	return !db ? _fail() : db.many(query, input)
	.tap(o => logger.debug('data.many', {result: json.string(o)}))
	.catch(e => logger.error('data.many', {error: e.stack}));
}

function map(query, input, transform) {
	logger.debug('data.map', {query, input: json.string(input)});
	return !db ? _fail() : db.map(query, input, transform)
	.tap(o => logger.debug('data.map', {result: json.string(o)}))
	.catch(e => logger.error('data.map', {error: e.stack}));
}

function namespace() {
	logger.debug('data.namespace', {query: sql.showDatabases()});
	return !db ? _fail() : db.map(sql.showDatabases(), null, i => i.datname)
	.tap(o => logger.debug('data.namespace', {databases: json.string(o)}))
	.catch(e => logger.error('data.namespace', {error: e.stack}));
}

function none(query, input) {
	logger.debug('data.none', {query, input: json.string(input)});
	return !db ? _fail() : db.none(query, input)
	.tap(x => logger.debug('data.none', {result: json.string(x)}))
	.catch(e => logger.error('data.none', {error: e.stack}));
}

function one(query, input) {
	logger.debug('data.one', {query, input: json.string(input)});
	return !db ? _fail() : db.one(query, input)
	.tap(o => logger.debug('data.one', {result: json.string(o)}))
	.catch(e => logger.error('data.one', {error: e.stack}));
}

function quit() {
	pool.end();
	db = null;
	logger.debug('data.postgres', {stopped: Date.now()});
}

function search(table, column, value) {
	logger.info('data.search', {table, column, value});
	return !db ? _fail() : db.any(sql.search(table, column), [value])
	.tap(o => logger.debug('data.search.result', {input: value, output: json.string(o)}))
	.catch(e => logger.error('data.search.result', {error: e.stack}));
}

function status() {
	logger.debug('data.status', {connected: !!db});
	return !db ? _fail() : db.any(sql.showTables())
	.tap(o => logger.debug('data.status', {tables: json.string(o)}))
	.catch(e => logger.error('data.status', {error: e.stack}));
}


connect();


module.exports = {
	any,
	connect,
	create,
	many,
	map,
	namespace,
	none,
	one,
	quit,
	search,
	status
};
