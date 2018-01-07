'use strict';
const Promise = require('bluebird');
const postgres = require('pg-promise');
const process = require('process');

const constant = require('../constant');
const json = require('../json');
const logger = require('../logger');

const namespace = `${constant.API_NAME}.data`;

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
		logger.debug(`${namespace}.notify`, {context, fresh, client});
		list();
	}
}


function any(query, input) {
	logger.debug(`${namespace}.any`, {query, input: json.string(input)});
	return !db ? _fail() : db.any(query, input)
	.tap(o => logger.debug(`${namespace}.any`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.any`, {error: e.stack}));
}

function connect() {
	logger.info(`${namespace}.postgres`, {host, port});
	pool = postgres(options);
	db = pool({host, port, user, password, database});
}

function create(database) {
	logger.info(`${namespace}.create`, {database});
	return !db ? _fail() : db.none(sql.createDatabase(database))
	.tap(x => logger.debug(`${namespace}.create`, {success: !x}))
	.catch(e => logger.error(`${namespace}.create`, {error: e.stack}));
}

function list() {
	logger.debug(`${namespace}.namespace`, {query: sql.showDatabases()});
	return !db ? _fail() : db.map(sql.showDatabases(), null, i => i.datname)
	.tap(o => logger.debug(`${namespace}.namespace`, {databases: json.string(o)}))
	.catch(e => logger.error(`${namespace}.namespace`, {error: e.stack}));
}

function many(query, input) {
	logger.debug(`${namespace}.many`, {query, input: json.string(input)});
	return !db ? _fail() : db.many(query, input)
	.tap(o => logger.debug(`${namespace}.many`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.many`, {error: e.stack}));
}

function map(query, input, transform) {
	logger.debug(`${namespace}.map`, {query, input: json.string(input)});
	return !db ? _fail() : db.map(query, input, transform)
	.tap(o => logger.debug(`${namespace}.map`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.map`, {error: e.stack}));
}

function none(query, input) {
	logger.debug(`${namespace}.none`, {query, input: json.string(input)});
	return !db ? _fail() : db.none(query, input)
	.tap(x => logger.debug(`${namespace}.none`, {result: json.string(x)}))
	.catch(e => logger.error(`${namespace}.none`, {error: e.stack}));
}

function one(query, input) {
	logger.debug(`${namespace}.one`, {query, input: json.string(input)});
	return !db ? _fail() : db.one(query, input)
	.tap(o => logger.debug(`${namespace}.one`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.one`, {error: e.stack}));
}

function quit() {
	pool.end();
	db = null;
	logger.debug(`${namespace}.postgres`, {stopped: Date.now()});
}

function search(table, column, value) {
	logger.info(`${namespace}.search`, {table, column, value});
	return !db ? _fail() : db.any(sql.search(table, column), [value])
	.tap(o => logger.debug(`${namespace}.search`, {input: value, output: json.string(o)}))
	.catch(e => logger.error(`${namespace}.search`, {error: e.stack}));
}

function status() {
	logger.debug(`${namespace}.status`, {connected: !!db});
	return !db ? _fail() : db.any(sql.showTables())
	.tap(o => logger.debug(`${namespace}.status`, {tables: json.string(o)}))
	.catch(e => logger.error(`${namespace}.status`, {error: e.stack}));
}


connect();


module.exports = {
	any,
	connect,
	create,
	list,
	many,
	map,
	none,
	one,
	quit,
	search,
	status
};
