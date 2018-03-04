'use strict';
const logger = require('../logger');
const {API_NAME} = require('../constant');

const namespace = `${API_NAME}.route.handler.server-error`;


function serverError(response, error) {
	logger.error(namespace, {failure: error.stack});
	response.set(template.serverError.headers)
	.status(template.serverError.status)
	.send(template.serverError.body(error));
}


module.exports = serverError;
