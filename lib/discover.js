'use strict';
const {partial} = require('lodash');
const {readdirSync} = require('fs');

const constant = require('./constant');
const logger = require('./logger');

const blacklist = /index.js|handler|node_modules|package.json|package-lock.json/;

const namespace = `${constant.API_NAME}.discover`;

let isRoute = false;


function discover(path) {
	logger.debug(namespace, {path});
	isRoute = path.split('/').pop() === 'route';
	return readdirSync(path).reduce(partial(inspect, path),  []);
}

function inspect(path, list, value) {
	if (value.indexOf('.') !== 0 && !value.match(blacklist)) {
		register(path, list, value);
	}
	return list;
}

function rbac(name) {
	return constant[name] || false;
}

function register(path, list, value) {
	const name = value.split('.').slice(0, -1).join('.');
	logger.debug(`${namespace}.register`, {name});
	list.push({
		module: `${path}/${name}`,
		name,
		path: `${path}/${value}`,
		secure: rbac(name)
	});
}


module.exports = discover;
