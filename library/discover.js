'use strict';
const readdir = require('fs').readdirSync;
const {partial} = require('lodash');

const constant = require('./constant');
const logger = require('./logger');

const blacklist = /index.js|node_modules|package.json|package-lock.json/;

const namespace = `${constant.API_NAME}.discover`;

let isRoute = false;


function discover(path) {
	logger.debug(namespace, {path});
	isRoute = path.split('/').pop() === 'route';
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
	const guarded = Boolean(constant[name]);
	logger[isRoute ? 'info' : 'debug'](`${namespace}.route.${name}`, {guarded});
	return constant[name];
}

function register(path, accumulator, value) {
	const name = value.split('.').slice(0, -1).join('.');
	logger.debug(`${namespace}.register`, {name});
	accumulator.push({
		module: `${path}/${name}`,
		name,
		path: `${path}/${value}`,
		secure: isRoute ? isGuarded(name) : isRoute
	});
}

module.exports = discover;
