'use strict';
const readdir = require('fs').readdirSync;
const {partial} = require('lodash');

const constant = require('./constant');
const logger = require('./logger');

const blacklist = /index.js|node_modules|package.json|yarn.lock/;


function discover(path) {
	logger.debug(`${constant.EXPRESS_HOST}.discover`, {path});
	return readdir(path).reduce(partial(inspect, path),  []);
}

function inspect(path, accumulator, value) {
	logger.debug(`${constant.EXPRESS_HOST}.discover.inspect`, {value});
	if (value.indexOf('.') !== 0 && !value.match(blacklist)) {
		register(path, accumulator, value);
	}
	return accumulator;
}

function register(path, accumulator, value) {
	const name = value.split('.').slice(0, -1).join('.');
	logger.debug(`${constant.EXPRESS_HOST}.discover.register`, {name});
	accumulator.push({
		module: `${path}/${name}`,
		name,
		path: `${path}/${value}`
	});
}

module.exports = discover;
