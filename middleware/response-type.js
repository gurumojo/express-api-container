'use strict';
const logger = require('../library/logger');
const {API_NAME} = require('../library/constant');

const namespace = `${API_NAME}.response`;

const header = {'Content-Type': 'application/json; charset=utf-8'};


function responseType(request, response, next) {
	logger.debug(namespace, header);
	response.set(header);
	next();
}


module.exports = responseType;
