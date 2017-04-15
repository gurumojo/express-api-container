'use strict';
const {forEach, includes, isArray, isObject, isObjectLike, omitBy} = require('lodash');

const LOGGER_BLACKLIST = ['cookie', 'flash', 'password', 'secret'];

function predicate(value, key) {
	return includes(LOGGER_BLACKLIST, key);
}

function scrub(item) {
	if (isObjectLike(item) && !isArray(item)) {
		return forEach(omitBy(item, predicate), (value, key, object) => {
			object[key] = isObject(value) ? omitBy(value, predicate) : value;
		});
	}
	return item;
}

module.exports = scrub;
