'use strict';
const redis = require('redis');
const {each, every, has, partial} = require('lodash');

const constant = require('./constant');
const json = require('./json');
const logger = require('./logger');

const namespace = `${constant.API_NAME}.pubsub`;

const host = constant.REDIS_HOST;
const port = constant.REDIS_PORT;
const registry = {};
let service = null;
const success = true;


function configure(channel) {
	logger.debug(`${namespace}.configure`, {channel});
	registry[channel].on('subscribe', (channel, count) => {
		logger.debug(`${namespace}.subscribe`, {channel, count, success});
		service.publish(channel, json.string({subscribe: success}));
	});
	registry[channel].on('message', (channel, message) => {
		logger.info(`${namespace}.message`, {channel, message});
	});
}

function initialize() {
	logger.debug(`${namespace}.initialize`, {active: false});
	if (!service) {
		service = create('service');
		logger.info(`${namespace}.redis`, {host, port});
	}
	each(registry, (object, channel, connection) => {
		if (!connection[channel]) {
			connection[channel] = create(channel);
			connection[channel].on('connect', partial(configure, channel));
		}
	});
}

function create(channel) {
	logger.debug(`${namespace}.create`, {channel});
	const connection = redis.createClient({host});
	connection.on('connect', partial(logger.debug, `${namespace}.${channel}`, {success}));
	connection.on('error', partial(logger.error, `${namespace}.${channel}`));
	return connection;
}


function publish(channel, message) {
	if (!registry[channel]) {
		logger.warn(`${namespace}.publish`, {invalid: channel});
	} else {
		logger.debug(`${namespace}.publish`, {channel});
		service.publish(channel, json.string(message));
	}
}

function quit() {
	logger.debug(`${namespace}.quit`, {shutdown: true});
	each(registry, (object, channel, connection) => {
		object.unsubscribe();
		object.quit();
		connection[channel] = null;
	});
	service.quit();
	service = null;
}

function subscribe(channel, handler) {
	logger.debug(`${namespace}.subscribe`, {channel});
	if (channel && !has(registry, channel)) {
		registry[channel] = null;
	}
	if (!every(registry)) {
		initialize();
	}
	registry[channel].subscribe(channel);
	if (handler) {
		registry[channel].on('message', handler);
	} else {
		return registry[channel];
	}
}


module.exports = {
	publish,
	quit,
	subscribe
};
