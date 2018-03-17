'use strict';
const {camelCase, partial} = require('lodash');

const {basename, extname} = require('path');
const {readdirSync, realpathSync, statSync} = require('fs');

const constant = require('./constant');

const blacklist = /^config|index.js|master.js|worker.js$/;

const namespace = `${constant.API_NAME}.discover`;


function demand(library) {
	return require(realpathSync(library));
}

function register(path, load, list, value) {
	if (value.indexOf('.') !== 0 && !value.match(blacklist)) {
		const name = basename(value, extname(value));
		list[camelCase(name)] = load
			? demand(`${path}/${value}`)
			: {
				module: `${path}/${name}`,
				name,
				path: `${path}/${value}`,
				secure: constant[name] || null
			};
	}
	return list;
}

function discover(path = '.', load = false) {
	if (typeof path !== 'string') {
		throw new TypeError('string input type required');
	}
	return readdirSync(path).reduce(partial(register, path, load),  {});
}


module.exports = discover;
