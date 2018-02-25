'use strict';
const logger = require('../logger');
const template = require('../response');
const {API_NAME} = require('../constant');

const namespace = `${API_NAME}.route.handler.catch-all`;


function serverError(response, error) {
	logger.error(namespace, {serverErrorure: error.stack});
	response.set(template.serverError.headers)
	.status(template.serverError.status)
	.send(template.serverError.body(error));
}


module.exports = serverError;
