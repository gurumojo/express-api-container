'use strict';
const Promise = require('bluebird');
const postgres = require('pg-promise');
const {cloneDeep, get} = require('lodash');

const constant = require('../constant');
const json = require('../json');
const logger = require('../logger');
const sql = require('./sql');

const namespace = `${constant.API_NAME}.data`;

const host = constant.POSTGRES_HOST;
const port = constant.POSTGRES_PORT;
const user = constant.POSTGRES_USER;
const password = constant.POSTGRES_PASSWORD;
const database = constant.POSTGRES_DB;
const role = `${database}_group`;
const pgUser = constant.POSTGRES_OPS_USER;
const pgPassword = constant.POSTGRES_OPS_PASSWORD;
const pgDatabase = constant.POSTGRES_OPS_DB;

const initOptions = {
	capSQL: true,
	//connect: _notify,
	promiseLib: Promise,
	//receive: _camelize
};

let cache = {};
let db = null;
let pg = null;
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

function _databases() {
	const cached = cache.databases;
	if (cached) {
		return Promise.resolve(cached);
	} else {
		return !pg
			? _fail(pgDatabase)
			: pg.map(sql.query.showDatabases, null, i => i.datname)
				.tap(o => {
					logger.debug(`${namespace}.databases`, {current: o});
					cache.databases = o;
				})
				.catch(e => logger.error(`${namespace}.databases`, {failure: e.stack}));
	}
}

function _dbBootstrap() {
	_pgHandshake();
	return Promise.all([_databases(), _roles()]).then(([dbs, roles]) => {
		if (!dbs.find(i => i === database)) {
			logger.debug(`${namespace}.bootstrap`, {database: 'missing'});
			if (!roles.find(i => i === database)) {
				logger.debug(`${namespace}.bootstrap`, {role: 'missing'});
				return _dbSetup().then(_dbImport);
			}
			return _dbImport();
		}
		logger.debug(`${namespace}.bootstrap`, {status: 'OK'});
	})
	.catch(e => {
		logger.error(`${namespace}.bootstrap`, {failure: e.stack});
		throw e;
	})
	.finally(_pgDisconnect);
}

function _dbCreate() {
	logger.debug(`${namespace}.database`, {create: database});
	return pg.none(sql.query.dropDatabase, {database})
		.then(() => pg.none(sql.query.createDatabase, {database}));
}

function _dbDisconnect() {
	db.$pool.end();
	db = null;
	cache = {};
	logger.debug(`${namespace}.pool`, {disconnect: database});
}

function _dbGrants() {
	logger.debug(`${namespace}.grant`, {database, role});
	return pg.none(sql.query.changeOwner, {database, role})
		//.then(() => pg.none(sql.query.revokeGrants, {role}))
		.then(() => Promise.all([
			pg.none(sql.query.grantConnect, {database, role}),
			pg.none(sql.query.grantRole, {role, user}),
			//pg.none(sql.query.grantDatabase, {database, role}),
			pg.none(sql.query.grantFutureSequences, {role}),
			pg.none(sql.query.grantFutureTables, {role})
		]));
}

function _dbHandshake() {
	logger.debug(`${namespace}.pool`, {handshake: database});
	db = pool({host, port, user, password, database});
}

function _dbImport() {
	return !pg
		? _fail(pgDatabase)
		: pg.none(sql.base)
			.then(() => logger.info(`${namespace}.import`, {success: 'base.sql'}))
			.then(_dbPatch)
			.catch(error => {
				logger.error(`${namespace}.import`, {failure: error.stack});
				throw error;
			});
}

function _dbPatch() {
	return sql.patch.map(patch => {
		return pg.none(patch).then(() => {
			logger.info(`${namespace}.patch`, {success: patch.file.split('/').pop()});
		});
	});
}

function _dbRevokes() {
	logger.debug(`${namespace}.revoke`, {database, role: 'public'});
	return Promise.all([
		pg.none(sql.query.revokePublicConnect, {database}),
		pg.none(sql.query.revokePublicSequences),
		pg.none(sql.query.revokePublicTables)
	]);
}

function _dbRole() {
	logger.debug(`${namespace}.role`, {create: role});
	return pg.none(sql.query.createRole, {role, partition: 'NOINHERIT'});
}

function _dbSetup() {
	return !pg
		? _fail(pgDatabase)
		: _dbCreate()
			.then(_dbRevokes)
			.then(_dbRole)
			.then(_dbUser)
			.then(_dbGrants)
			.catch(e => logger.error(`${namespace}.setup`, {failure: e.stack}));
}

function _dbUser() {
	logger.debug(`${namespace}.user`, {create: user});
	return pg.none(sql.query.createUser, {user, secret: password});
}

function _fail(name) {
	return Promise.reject(new Error(`${name}: database connection failure`));
}

function _notify(client, context, fresh) {
	if (fresh) {
		logger.debug(`${namespace}.notify`, {context, fresh, client});
		list();
	}
}

function _pgDisconnect() {
	pg.$pool.end();
	pg = null;
	logger.debug(`${namespace}.pool`, {disconnect: pgDatabase});
}

function _pgHandshake() {
	logger.debug(`${namespace}.pool`, {handshake: pgDatabase});
	pg = pool({host, port, user: pgUser, password: pgPassword, database: pgDatabase});
}

function _roles() {
	const cached = cache.roles;
	if (cached) {
		return Promise.resolve(cached);
	} else {
		return !pg
			? _fail(pgDatabase)
			: pg.map(sql.query.getRoles, null, i => i.rolname)
				.tap(o => {
					logger.debug(`${namespace}.roles`, {current: o});
					cache.roles = o;
				})
				.catch(e => logger.error(`${namespace}.roles`, {failure: e.stack}));
	}
}

function _tables() {
	const cached = get(cache, 'tables');
	if (cached) {
		return Promise.resolve(cached);
	} else {
		return !pg
			? _fail(pgDatabase)
			: pg.any(sql.query.showTables)
				.tap(o => {
					logger.debug(`${namespace}.tables`, {current: o});
					cache.tables = o;
				})
				.catch(e => logger.error(`${namespace}.tables`, {failure: e.stack}));
	}
}


function any(query, input) {
	logger.debug(`${namespace}.any`, {query, input: json.string(input)});
	return !db ? _fail(database) : db.any(query, input)
	.tap(o => logger.debug(`${namespace}.any`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.any`, {error: e.stack}));
}

function connect() {
	logger.debug(`${namespace}.connect`, {database});
	pool = postgres(initOptions);
	return _dbBootstrap().then(_dbHandshake).then(() => {
		logger.info(`${namespace}.postgres`, {host, port});
	});
}

function describe() {
	if (cache.databases && cache.tables) {
		return Promise.resolve(cloneDeep(cache));
	} else {
		return Promise.props({databases: _databases(), tables: _tables()})
		.tap(o => logger.debug(`${namespace}.describe`, {result: json.string(o)}))
		.catch(e => logger.error(`${namespace}.describe`, {error: e.stack}));
	}
}

function disconnect() {
	_dbDisconnect();
	logger.info(`${namespace}.disconnect`, {database});
}

function many(query, input) {
	logger.debug(`${namespace}.many`, {query, input: json.string(input)});
	return !db ? _fail(database) : db.many(query, input)
	.tap(o => logger.debug(`${namespace}.many`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.many`, {error: e.stack}));
}

function map(query, input, transform) {
	logger.debug(`${namespace}.map`, {query, input: json.string(input)});
	return !db ? _fail(database) : db.map(query, input, transform)
	.tap(o => logger.debug(`${namespace}.map`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.map`, {error: e.stack}));
}

function none(query, input) {
	logger.debug(`${namespace}.none`, {query, input: json.string(input)});
	return !db ? _fail(database) : db.none(query, input)
	.tap(x => logger.debug(`${namespace}.none`, {result: json.string(x)}))
	.catch(e => logger.error(`${namespace}.none`, {error: e.stack}));
}

function one(query, input) {
	logger.debug(`${namespace}.one`, {query, input: json.string(input)});
	return !db ? _fail(database) : db.one(query, input)
	.tap(o => logger.debug(`${namespace}.one`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.one`, {error: e.stack}));
}

function search(table, column, value) {
	logger.info(`${namespace}.search`, {table, column, value});
	return !db ? _fail(database) : db.any(sql.query.search, {table, column, value})
	.tap(o => logger.debug(`${namespace}.search`, {input: value, output: json.string(o)}))
	.catch(e => logger.error(`${namespace}.search`, {error: e.stack}));
}

function status() {
	logger.debug(`${namespace}.status`, {connected: !!db, database});
	return !db ? _fail(database) : db.any(sql.query.showTables)
	.tap(o => logger.debug(`${namespace}.status`, {tables: json.string(o)}))
	.catch(e => logger.error(`${namespace}.status`, {error: e.stack}));
}


connect();


module.exports = {
	any,
	connect,
	describe,
	disconnect,
	many,
	map,
	none,
	one,
	search,
	status
};
