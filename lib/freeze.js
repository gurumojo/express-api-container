'use strict';
const logger = require('./logger');
const {API_NAME} = require('./constant');

const namespace = `${API_NAME}.freeze`;


function freeze(x) {
	let object = null;
	try {
		object = Object.freeze(Object.keys(x).reduce((o, m) => {
			o[m] = x[m] && typeof x[m] === 'object' ? freeze(x[m]) : x[m];
			return o;
		}, {}));
	} catch (x) {
		logger.warn(namespace, {failure: x.message});
	}
	return object;
}


module.exports = freeze;
