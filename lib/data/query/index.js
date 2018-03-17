'use strict';
const admin = require('./admin');
const getUser = require('./get-user');
const putUser = require('./put-user');

const SQL = {

	getUser, // ... $[where] ... -- e.id = entity_id AND e.uuid = entity_uuid

	getCredential: `SELECT * FROM entity WHERE uuid = $[uuid]`,

	getEntity: `SELECT * FROM entity WHERE id = $[id]`,

	getProfile: `SELECT * FROM profile WHERE entity_id = $[entityID]`,

	getToken: `SELECT * FROM token WHERE sub = $[sub]`,

	putToken: `INSERT INTO token (sub, refresh) VALUES ($[sub], $[refresh])
		ON CONFLICT (sub) DO UPDATE SET refresh = EXCLUDED.refresh`,

	putUser, // ... $[uuid], $[cipher], $[salt], ...
		// $[email], $[name], $[description], $[content] ...

	search: `SELECT * FROM $[table^] WHERE $[column^] LIKE '%$[value^]%'`
};


function minify(object, member) {
	object[member] = object[member].trim().replace(/\s+/g, ' ');
	return object;
}


module.exports = Object.freeze(Object.keys(Object.assign(SQL, admin)).reduce(minify, SQL));
