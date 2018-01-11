'use strict';
const data = require('../library/data');
const logger = require('../library/logger');
const {API_NAME} = require('../library/constant');

const namespace = `${API_NAME}.request`;


function requestData(request, response, next) {
	logger.debug(namespace, {data: 'attached'});
	request.data = data;
	next();
}


module.exports = requestData;
