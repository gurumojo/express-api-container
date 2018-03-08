'use strict';
const {forEach, includes, isArray, isObject, isObjectLike, isString, omitBy} = require('lodash');

const constant = require('../constant');
const json = require('../json');

function blacklist(value, key) {
	return includes(constant.LOGGER_BLACKLIST_OBJECT_MEMBER, key);
}

function assign(value, key, object) {
	if (key==='body') {
		object[key] = scrub(value);
	} else {
		object[key] = isObject(value) ? omitBy(value, blacklist) : value;
	}
}

function scrub(item) {
	if (isObjectLike(item) && !isArray(item)) {
		return forEach(omitBy(item, blacklist), assign);
	} else if(isString(item)) {
		let object = scrub(json.object(item));
		if (item.match(/\n/)) {
			return json.pretty(object);
		}
		return json.string(object);
	} else if (isArray(item)) {
		return item.map(scrub);
	}
	return item;
}

module.exports = scrub;
