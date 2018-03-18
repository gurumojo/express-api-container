'use strict';
const logger = require('../../logger');
const {API_NAME} = require('../../constant');

const namespace = `${API_NAME}.route.handler.server-error`;


function serverError(response, error) {
	logger.error(namespace, {failure: error.stack});
	response.locals.template.internalServerError.dispatch(response);
}


module.exports = serverError;
