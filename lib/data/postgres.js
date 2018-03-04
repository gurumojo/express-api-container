'use strict';
const Promise = require('bluebird');
const postgres = require('pg-promise');
const {clone} = require('lodash');

const json = require('../json');
const logger = require('../logger');
const {API_NAME} = require('../constant');

const sql = require('./sql');

const initOptions = {
	capSQL: true,
	//connect: onConnect,
	promiseLib: Promise,
	//receive: onReceive
};

const init = postgres(initOptions);

const defaultAccess = {
	role: 'public',
	schema: 'public',
	type: 'NOINHERIT'
};

const namespace = `${API_NAME}.data.postgres`;

let dbOptions = null;
let pgOptions = null;


function bootstrap(pgOpts, dbOpts) {
	dbOptions = clone(dbOpts);
	pgOptions = clone(pgOpts);
	let pg = connect();
	logger.debug(`${namespace}.interface`, {'': json.string(Object.keys(pg))});
	return Promise.all([databases(pg), roles(pg)])
	.then(([dbs, roles]) => {
		if (!dbs.find(i => i === dbOptions.database)) {
			if (!roles.find(i => i === dbOptions.user)) {
				return provision(pg).then(() => prime(demote(pg)));
			}
			return prime(demote(pg));
		}
		return patch(demote(pg));
	})
	.then(pg => {
		release(pg);
		logger.info(`${namespace}.ready`, dbOptions);
	})
	.catch(e => {
		logger.error(`${namespace}.bootstrap`, {failure: e.stack});
		release(pg);
		throw e;
	});
}

function connect(options) {
	logger.debug(`${namespace}.connect`, options || pgOptions);
	if (options) {
		dbOptions = clone(options);
	}
	return init(options ? dbOptions : pgOptions);
}

function demote(pg) {
	release(pg);
	return connect(dbOptions);
}

function release(pg) {
	pg.$pool.end();
	pg = null;
	logger.debug(`${namespace}.release`, {connection: pg});
}




function provision(pg) {
	return createAdminRole(pg)
	.then(createUsageRole)
	.then(createDatabase)
	.then(revokeRoleDefaults)
	.then(grantRoleDefaults)
	.then(createLoginRole)
	.catch(e => {
		logger.error(`${namespace}.provision`, {failure: e.stack});
		throw e;
	});
}

function createAdminRole(pg) {
	let options = {role: `${dbOptions.database}_admin`, type: defaultAccess.type};
	logger.debug(`${namespace}.create`, options);
	return pg.none(sql.query.createRole, options)
	.then(() => pg);
}

function createUsageRole(pg) {
	let options = {role: `${dbOptions.database}_usage`, type: defaultAccess.type};
	logger.debug(`${namespace}.create`, options);
	return pg.none(sql.query.createRole, options)
	.then(() => pg);
}

function createDatabase(pg) {
	let {database} = dbOptions;
	let options = {database, role: `${database}_admin`};
	logger.debug(`${namespace}.create`, options);
	return pg.none(sql.query.dropDatabase, options)
	.then(() => pg.none(sql.query.createDatabase, options))
	.then(() => pg);
}

function revokeRoleDefaults(pg) {
	let {role, schema} = defaultAccess;
	let {database} = dbOptions;
	let options = {database, role, schema};
	logger.debug(`${namespace}.revoke`, options);
	return Promise.all([
		pg.none(sql.query.revokeDatabaseGrants, options),
		pg.none(sql.query.revokeFunctionGrants, options),
		pg.none(sql.query.revokeSequenceGrants, options),
		pg.none(sql.query.revokeTableGrants, options)
	])
	.then(() => pg);
}

function grantRoleDefaults(pg) {
	let {schema} = defaultAccess;
	let {database} = dbOptions;
	let adminOptions = {database, role: `${database}_admin`, schema};
	let usageOptions = {database, role: `${database}_usage`, schema};
	logger.debug(`${namespace}.grant`, {database, role: `${database}_*`, schema});
	return Promise.each([
		[sql.query.grantDatabaseAdmin, adminOptions],
		[sql.query.grantDefaultFunctionAdmin, adminOptions],
		[sql.query.grantDefaultSequenceAdmin, adminOptions],
		[sql.query.grantDefaultTableAdmin, adminOptions],
		[sql.query.grantDatabaseUsage, usageOptions],
		[sql.query.grantDefaultFunctionUsage, usageOptions],
		[sql.query.grantDefaultSequenceUsage, usageOptions],
		[sql.query.grantDefaultTableUsage, usageOptions]
	], ([query, options]) => pg.none(query, options))
	.then(() => pg);
}

function createLoginRole(pg) {
	let options = {
		user: dbOptions.user,
		role: `${dbOptions.database}_admin`,
		secret: dbOptions.password
	};
	logger.debug(`${namespace}.create`, options);
	return pg.none(sql.query.createUser, options)
	.then(() => pg.none(sql.query.grantRole, options))
	.then(() => pg);
}

/*
The entries shown by \dp are interpreted thus:

rolename=xxxx -- privileges granted to a role
        =xxxx -- privileges granted to PUBLIC

            r -- SELECT ("read")
            w -- UPDATE ("write")
            a -- INSERT ("append")
            d -- DELETE
            D -- TRUNCATE
            x -- REFERENCES
            t -- TRIGGER
            X -- EXECUTE
            U -- USAGE
            C -- CREATE
            c -- CONNECT
            T -- TEMPORARY
      arwdDxt -- ALL PRIVILEGES (for tables, varies for other objects)
            * -- grant option for preceding privilege

        /yyyy -- role that granted this privilege
*/




function prime(pg) {
	return resetSchema(pg)
	.then(applyPatches)
	.then(() => pg)
	.catch(e => {
		logger.error(`${namespace}.prime`, {failure: e.stack});
		throw e;
	});
}

function resetSchema(pg) {
	logger.debug(`${namespace}.schema`, {'reset': 'public'});
	return pg.none(sql.base)
	.then(() => pg);
}

function applyPatches(pg) {
	return Promise.mapSeries(sql.patch, query => {
		return pg.none(query).then(() => {
			logger.info(`${namespace}.patch`, {applied: query.file.split('/').pop()});
		});
	})
	.then(() => pg);
}




function patch(pg) {
	return applyPatches(pg)
	.then(() => pg)
	.catch(e => {
		logger.error(`${namespace}.patch`, {failure: e.stack});
		throw e;
	});
}




function purge(pg) {
	return revertPatches()
	.then(() => pg)
	.catch(e => {
		logger.error(`${namespace}.purge`, {failure: e.stack});
		throw e;
	});
}

function revertPatches(pg) {
	return Promise.mapSeries(sql.purge, query => {
		return pg.none(query).then(() => {
			logger.info(`${namespace}.purge`, {reverted: query.file.split('/').pop()});
		});
	})
	.then(() => pg);
}




function databases(pg) {
	return pg.map(sql.query.showDatabases, null, i => i.datname)
		.tap(o => {
			logger.debug(`${namespace}.databases`, {'': json.string(o)});
		})
		.catch(e => {
			logger.error(`${namespace}.databases`, {failure: e.stack})
			throw e;
		});
	
}

function roles(pg) {
	return pg.map(sql.query.getRoles, null, i => i.rolname)
		.tap(o => {
			logger.debug(`${namespace}.roles`, {'': json.string(o)});
		})
		.catch(e => {
			logger.error(`${namespace}.roles`, {failure: e.stack})
			throw e;
		});
}




function status(pg) {
	
}


module.exports = {
	bootstrap,
	connect,
	patch,
	purge,
	release,
	status
};
