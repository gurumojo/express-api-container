'use strict';
const logger = require('../logger');
const template = require('../response');
const {API_NAME} = require('../constant');

const namespace = `${API_NAME}.route.handler.catch-all`;


function catchAll(response, error) {
	logger.error(namespace, {failure: error.message});
	response.set(template.serverError.headers)
	.status(template.serverError.status)
	.send(template.serverError.body(error));
}


module.exports = catchAll;
