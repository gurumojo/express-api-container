'use strict';
const describe = require('./describe');

const SQL = Object.freeze({

	changeOwner: `ALTER DATABASE $[database^] OWNER TO $[role^]`,

	createDatabase: `CREATE DATABASE $[database^] ENCODING 'UTF8'`,
		// OWNER $[role] TABLESPACE $[path] CONNECTION LIMIT $[limit]

	createRole: `CREATE ROLE $[role^] $[permission^]`,

	createUser: `CREATE USER $[user^] WITH PASSWORD $[secret]`,

	describe, // ... $[schema^] ... $[table^] ...

	dropDatabase: `DROP DATABASE IF EXISTS $[database^]`,

	dropRole: `DROP ROLE IF EXISTS $[role^]`,

	dropUser: `DROP USER IF EXISTS $[user^]`,

	getRoles: `SELECT rolname FROM pg_roles
		WHERE rolname NOT IN ('pg_monitor', 'pg_read_all_settings',
			'pg_read_all_stats', 'pg_signal_backend', 'pg_stat_scan_tables')`,

	grantConnect: `GRANT connect ON DATABASE $[database^] TO $[role^]`,

	grantDatabase: `GRANT ALL PRIVILEGES ON DATABASE $[database^] TO $[role^]`,

	grantCurrentSequences: `GRANT usage
		ON ALL SEQUENCES IN SCHEMA public TO $[role^]`,

	grantCurrentTables: `GRANT select, insert, update, delete
		ON ALL TABLES IN SCHEMA public TO $[role^]`,

	grantFutureSequences: `ALTER DEFAULT PRIVILEGES IN SCHEMA public
		GRANT usage ON SEQUENCES TO $[role^]`,

	grantFutureTables: `ALTER DEFAULT PRIVILEGES IN SCHEMA public
		GRANT select, insert, update, delete ON TABLES TO $[role^]`,

	grantRole: `GRANT $[role^] TO $[user^]`,

	resetRole: `RESET ROLE`,

	revokeGrants: `REVOKE ALL FROM $[role^]`,

	revokePublicConnect: `REVOKE connect ON DATABASE $[database^] FROM PUBLIC`,

	revokePublicSequences: `REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC`,

	revokePublicTables: `REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC`,

	revokeRole: `REVOKE $[role^] FROM $[user^]`,

	search: `SELECT * FROM $[table^] WHERE $[column^] LIKE '%$[value^]%'`,

	setRole: `SET ROLE '$[role]'`,

	showDatabases: `SELECT datname FROM pg_database
		WHERE datname NOT IN ('template0', 'template1')`,

	showTables: `SELECT * FROM pg_catalog.pg_tables
		WHERE schemaname NOT IN ('pg_catalog', 'information_schema')`,

	useSchema: `SET search_path TO $[view]`
});

//new postgres.ParameterizedQuery(`SELECT * FROM $[table] WHERE $[column] LIKE '%$[value]%'`)

module.exports = SQL;
