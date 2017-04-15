'use strict';
const Promise = require('bluebird');
const process = require('process');
const readdir = require('fs').readdirSync;
const redis = require('redis');
const {includes, partial} = require('lodash');

const logger = require('../logger');

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
Promise.promisifyAll(redis.Multi.prototype); // transactional execution

const DISCOVERY_BLACKLIST = [];
const LOCAL_JSON_PATH = 'etc';

const namespace = readdir(`${__dirname}/${LOCAL_JSON_PATH}`).reduce(discover, {});

const host = process.env.REDIS_HOST || 'localhost';
const db = redis.createClient({host});
const interval = setInterval(poll, process.env.POLL_TIMEOUT || 100);
let complete = false;


function discover(namespace, file) {
	logger.info('fixture.discover', {file});
	if (!includes(DISCOVERY_BLACKLIST, file) && file.indexOf('.') !== 0) {
		const member = file.slice(0, file.indexOf('.'));
		namespace[member] = require(`./${LOCAL_JSON_PATH}/${file}`);
	}
	return namespace;
}

function list(result) {
	result.forEach(key => {
		const type = key.slice(0, key.indexOf(':'));
		db.hgetallAsync(key).then(
			partial(logger.debug, `fixture.${type}`),
			partial(logger.error, `fixture.${type}`)
		);
	});
}

function load() {
	logger.debug('fixture.load', {namespace});
	for (var member in namespace) {
		namespace[member].forEach(instance => db.hmset(
			`${singular(member)}:${instance.id}`, instance
		));
	}
}

function poll() {
	logger.debug('fixture.poll', {complete});
	if (complete) {
		clearInterval(interval);
		db.quit();
	}
}

function singular(name) {
	return name.slice(0, -1);
}


db.on('connect', () => {
	db.flushdbAsync()
	.then(load)
	.then(() => db.keysAsync('*'))
	.then(list)
	.catch(partial(logger.error, 'redis.keys'))
	.finally(() => complete = true);
});
