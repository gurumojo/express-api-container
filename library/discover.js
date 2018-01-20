'use strict';
const readdir = require('fs').readdirSync;
const {partial} = require('lodash');

const logger = require('./logger');
const {API_NAME} = require('./constant');

const blacklist = /index.js|node_modules|package.json|yarn.lock/;

const namespace = `${API_NAME}.discover`;


function discover(path) {
	logger.debug(namespace, {path});
	return readdir(path).reduce(partial(inspect, path),  []);
}

function inspect(path, accumulator, value) {
	logger.debug(`${namespace}.inspect`, {value});
	if (value.indexOf('.') !== 0 && !value.match(blacklist)) {
		register(path, accumulator, value);
	}
	return accumulator;
}

function isGuarded(name) {
	logger.debug(`${namespace}.isGuarded`, {name, secure: !!constant[name]});
	return constant[name];
}

function register(path, accumulator, value) {
	const name = value.split('.').slice(0, -1).join('.');
	logger.debug(`${namespace}.register`, {name});
	accumulator.push({
		module: `${path}/${name}`,
		name,
		path: `${path}/${value}`,
		secure: isGuarded(name)
	});
}

module.exports = discover;
