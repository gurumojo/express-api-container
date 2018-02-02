'use strict';
const {QueryFile} = require('pg-promise');
const {join} = require('path');
const {readdirSync} = require('fs');

const query = require('./query');

const base = new QueryFile(join(__dirname, '/schema/public.sql'));

const patch = readdirSync(join(__dirname, '/schema/patch'))
	.filter(file => file.match(/\.sql$/))
	.map(file => new QueryFile(join(__dirname, '/schema/patch/', file)));

const purge = readdirSync(join(__dirname, '/schema/purge'))
	.filter(file => file.match(/\.sql$/))
	.map(file => new QueryFile(join(__dirname, '/schema/purge/', file)));

module.exports = Object.freeze({
	base,
	patch,
	purge,
	query
});
