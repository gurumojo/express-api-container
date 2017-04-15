'use strict';
const Promise = require('bluebird');
const dns = require('dns');
const process = require('process');
const redis = require('redis');
const {isArray, isPlainObject, isString, omit, partial} = require('lodash');

const logger = require('../logger');

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
Promise.promisifyAll(redis.Multi.prototype); // transactional execution

const host = process.env.REDIS_HOST || 'localhost';
const init = Date.now();
const keepalive = {
	delay: process.env.POLL_INTERVAL || 100,
	limit: process.env.POLL_TIMEOUT || 10000
};
const regex = {
	IPv4: /^(\d{1,3}\.){3,3}\d{1,3}$/,
	IPv6: /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i
}
const hostIsIP = !!regex.IPv4.test(host) || !!regex.IPv6.test(host);
const lookupType = hostIsIP ? 'reverse' : 'resolve';
let db = null;
let hold = false;


function connect() {
	logger.debug('data.connect', {active: false});
	db = redis.createClient({host});
	db.on('connect', connectionInfo);
	db.on('error', partial(logger.error, 'data.redis'));
}

function connectionInfo() {
	logger.info('data.connect', {active: true});
	db.infoAsync('server')
	.then(server => logger.debug('data.server', rewrite(server)));
	db.infoAsync('keyspace')
	.then(keys => logger.debug('data.keys', rewrite(keys)));
	clearInterval(keepalive.interval);
}

function fail() {
	logger.warn('data.init', {timeout: true});
	clearInterval(keepalive.interval);
}

function get(key) {
	logger.debug('data.get', {key});
	if (isString(key)) {
		return db.hgetallAsync(key);
	} else if (isArray(key)) {
		return db.hgetAsync(key);
	} else {
		return Promise.reject(new Error('string | string[] input required'));
	}
}

function keys(pattern) {
	logger.debug('data.keys', {pattern});
	if (isString(pattern)) {
		return db.hkeysAsync(pattern);
	} else {
		return Promise.reject(new Error('string input required'));
	}
}

function poll(keepalive) {
	if (!hold) {
		testAndConnect();
	}
	keepalive.timestamp = Date.now();
	keepalive.uptime = keepalive.timestamp - init;
	logger.debug('data.poll', omit(keepalive, 'interval'));
}

function quit() {
	db.quit();
	db = null;
	logger.info('data.connect', {active: false});
}

function rewrite(item) {
	if (isString(item)) {
		return item
		.replace(/\s/gm, ' ')
		.replace(/# \w*  /, '')
		.replace(/  /g, ', ')
		.replace(/:/g, '=')
		.replace(/,(\w)/g, (m, p1) => `, ${p1}`)
		.replace(/, $/, '')
	}
	return item;
}

function search(type, member, value) {
	logger.debug('data.search', {type, member, value});
	return db.keysAsync(`${type}:*`)
	.then(hits => Promise.map(hits, target => get([target, member])
		.then(item => (value === item ? get(target) : null))
	));
}

function set(key, member, value) {
	logger.debug('data.set', {key, member, value});
	if (isString(member)) {
		return db.hsetAsync(key, member, value);
	} else if (isPlainObject(member)) {
		return db.hmsetAsync(key, member);
	} else {
		return Promise.reject(new Error(
			'(string, string, string) | (string, {string, ...}) input required'
		));
	}
}

function testAndConnect() {
	dns[lookupType](host, (error, name) => {
		if (error) {
			logger.warn(`data.connect DNS ${lookupType} failure`, error);
		} else {
			clearTimeout(keepalive.timeout);
			hold = true;
			connect();
		}
	});
}

function vals(key) {
	logger.debug('data.vals', {key});
	if (isString(key)) {
		return db.hvalsAsync(key);
	} else {
		return Promise.reject(new Error('string input required'));
	}
}


if (host) {
	keepalive.interval = setInterval(poll, keepalive.delay, keepalive);
    keepalive.timeout = setTimeout(fail, keepalive.limit);
} else {
	logger.error('data.init', {required: 'process.env.REDIS_HOST'});
}


module.exports = {
	connect,
	get,
	keys,
	quit,
	search,
	set,
	vals
};
