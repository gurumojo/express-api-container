'use strict';
const init = Date.now();

const Promise = require('bluebird');
const cores = require('os').cpus().length;
const process = require('process');
const redis = require('redis');
const {isArray, isPlainObject, isString, pick, partial} = require('lodash');

const logger = require('../logger');

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
Promise.promisifyAll(redis.Multi.prototype); // transactional execution

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = process.env.REDIS_PORT || 6379;
const keepalive = {
	delay: process.env.POLL_INTERVAL || 1000,
	limit: process.env.POLL_TIMEOUT || 10000
};
let db = null;
let hold = false;


function connect() {
	logger.debug('data.connect', {active: false});
	db = redis.createClient({host, port});
	db.on('connect', connectionInfo);
	db.on('error', error => {
		logger.error('data.redis', error);
		hold = false;
	});
}

function connectionInfo() {
	clearTimeout(keepalive.timeout);
	clearInterval(keepalive.interval);
	logger.info('data.redis', {host, port});
	db.infoAsync('server')
	.then(server => logger.debug('data.server', rewrite(server)));
	db.infoAsync('keyspace')
	.then(keys => logger.debug('data.keys', rewrite(keys)));
}

function fail() {
	logger.error('data.fail', {host, port, timeout: 'redis.createClient'});
	process.exit(1);
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

function holdAndConnect() {
	hold = true;
	connect();
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
		holdAndConnect();
	}
	keepalive.timestamp = Date.now();
	keepalive.uptime = keepalive.timestamp - init;
	logger.debug('data.poll', pick(keepalive, ['delay', 'limit', 'timestamp', 'uptime']));
}

function quit() {
	db.quit();
	db = null;
	logger.info('data.connect', {timestamp: Date.now(), active: false});
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
