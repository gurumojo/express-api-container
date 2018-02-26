'use strict';
const Promise = require('bluebird');
const {partial} = require('lodash');

const json = require('../json');
const logger = require('../logger');
const {API_NAME} = require('../constant');

const sql = require('./sql');

const namespace = `${API_NAME}.data.query`;


function any(pg, query, input) {
	logger.debug(`${namespace}.any`, {query, input: json.string(input)});
	return pg.any(query, input)
	.tap(o => logger.debug(`${namespace}.any`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.any`, {failure: e.stack}));
}

function many(pg, query, input) {
	logger.debug(`${namespace}.many`, {query, input: json.string(input)});
	return pg.many(query, input)
	.tap(o => logger.debug(`${namespace}.many`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.many`, {failure: e.stack}));
}

function map(pg, query, input, transform) {
	logger.debug(`${namespace}.map`, {query, input: json.string(input)});
	return pg.map(query, input, transform)
	.tap(o => logger.debug(`${namespace}.map`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.map`, {failure: e.stack}));
}

function maybe(pg, query, input) {
	logger.debug(`${namespace}.maybe`, {query, input: json.string(input)});
	return pg.oneOrNone(query, input)
	.tap(o => logger.debug(`${namespace}.maybe`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.maybe`, {failure: e.stack}));
}

function none(pg, query, input) {
	logger.debug(`${namespace}.none`, {query, input: json.string(input)});
	return pg.none(query, input)
	.tap(o => logger.debug(`${namespace}.none`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.none`, {failure: e.stack}));
}

function one(pg, query, input) {
	logger.debug(`${namespace}.one`, {query, input: json.string(input)});
	return pg.one(query, input)
	.tap(o => logger.debug(`${namespace}.one`, {result: json.string(o)}))
	.catch(e => logger.error(`${namespace}.one`, {failure: e.stack}));
}


module.exports = (pg) => ({
	any: partial(any, pg),
	many: partial(many, pg),
	map: partial(map, pg),
	maybe: partial(maybe, pg),
	none: partial(none, pg),
	one: partial(one, pg),
	query: sql.query
});
