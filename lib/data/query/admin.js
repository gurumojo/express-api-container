'use strict';
const describe = require('./describe');

const SQL = {

	changeOwner: `ALTER DATABASE $[database^] OWNER TO $[role^]`,

	createDatabase: `CREATE DATABASE $[database^] ENCODING 'UTF8' OWNER $[role]`,
		// TABLESPACE $[path] CONNECTION LIMIT $[limit]

	createRole: `CREATE ROLE $[role^] $[type^]`,

	createUser: `CREATE USER $[user^] WITH PASSWORD $[secret]`,

	describe, // ... $[schema^] ... $[table^] ...

	dropDatabase: `DROP DATABASE IF EXISTS $[database^]`,

	dropRole: `DROP ROLE IF EXISTS $[role^]`,

	dropUser: `DROP USER IF EXISTS $[user^]`,

	getRoles: `SELECT rolname FROM pg_roles
		WHERE rolname NOT IN ('pg_monitor', 'pg_read_all_settings',
			'pg_read_all_stats', 'pg_signal_backend', 'pg_stat_scan_tables')`,

	grantDatabaseAdmin: `GRANT ALL
		ON DATABASE $[database^] TO $[role^]`,

	grantDatabaseUsage: `GRANT connect
		ON DATABASE $[database^] TO $[role^]`,

	grantDefaultFunctionAdmin: `ALTER DEFAULT PRIVILEGES
		FOR ROLE $[role^] IN SCHEMA $[schema^]
		GRANT ALL ON FUNCTIONS TO $[role^]`,

	grantDefaultFunctionUsage: `ALTER DEFAULT PRIVILEGES
		FOR ROLE $[role^] IN SCHEMA $[schema^]
		GRANT execute ON FUNCTIONS TO $[role^]`,

	grantDefaultSequenceAdmin: `ALTER DEFAULT PRIVILEGES
		FOR ROLE $[role^] IN SCHEMA $[schema^]
		GRANT ALL ON SEQUENCES TO $[role^]`,

	grantDefaultSequenceUsage: `ALTER DEFAULT PRIVILEGES
		FOR ROLE $[role^] IN SCHEMA $[schema^]
		GRANT usage ON SEQUENCES TO $[role^]`,

	grantDefaultTableAdmin: `ALTER DEFAULT PRIVILEGES
		FOR ROLE $[role^] IN SCHEMA $[schema^]
		GRANT ALL ON TABLES TO $[role^]`,

	grantDefaultTableUsage: `ALTER DEFAULT PRIVILEGES
		FOR ROLE $[role^] IN SCHEMA $[schema^]
		GRANT select, insert, update, references, trigger ON TABLES TO $[role^]`,

	grantFunctionAdmin: `GRANT ALL
		ON ALL FUNCTIONS IN SCHEMA $[schema^] TO $[role^]`,

	grantFunctionUsage: `GRANT execute
		ON ALL FUNCTIONS IN SCHEMA $[schema^] TO $[role^]`,

	grantSequenceAdmin: `GRANT ALL
		ON ALL SEQUENCES IN SCHEMA $[schema^] TO $[role^]`,

	grantSequenceUsage: `GRANT usage
		ON ALL SEQUENCES IN SCHEMA $[schema^] TO $[role^]`,

	grantTableAdmin: `GRANT ALL
		ON ALL TABLES IN SCHEMA $[schema^] TO $[role^]`,

	grantTableUsage: `GRANT select, insert, update, references, trigger
		ON ALL TABLES IN SCHEMA $[schema^] TO $[role^]`,

	grantRole: `GRANT $[role^] TO $[user^]`,

	resetRole: `RESET ROLE`,

	revokeDatabaseGrants: `REVOKE ALL
		ON DATABASE $[database^] FROM $[role^]`,

	revokeFunctionGrants: `REVOKE ALL
		ON ALL FUNCTIONS IN SCHEMA $[schema^] FROM $[role^]`,

	revokeSequenceGrants: `REVOKE ALL
		ON ALL SEQUENCES IN SCHEMA $[schema^] FROM $[role^]`,

	revokeTableGrants: `REVOKE ALL
		ON ALL TABLES IN SCHEMA $[schema^] FROM $[role^]`,

	revokeRole: `REVOKE $[role^] FROM $[user^]`,

	setRole: `SET ROLE $[role^]`,

	showDatabases: `SELECT datname FROM pg_database
		WHERE datname NOT IN ('template0', 'template1')`,

	showTables: `SELECT * FROM pg_catalog.pg_tables
		WHERE schemaname NOT IN ('pg_catalog', 'information_schema')`,

	useSchema: `SET search_path TO $[view^]`
};


module.exports = SQL;
