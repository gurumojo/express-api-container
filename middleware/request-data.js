'use strict';
const data = require('../library/data');
const logger = require('../library/logger');
const {API_NAME} = require('../library/constant');

const namespace = `${API_NAME}.request.data`;


function requestData(request, response, next) {
	logger.debug(namespace, {attached: true});
	request.data = data;
	next();
}


module.exports = requestData;
