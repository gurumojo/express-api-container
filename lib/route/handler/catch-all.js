'use strict';
const logger = require('../../logger');
const {API_NAME} = require('../../constant');

const namespace = `${API_NAME}.route.handler.catch-all`;


function catchAll(response, error) {
	logger.warn(namespace, {failure: error.message});
	response.locals.template.methodNotAllowed.dispatch(response);
}


module.exports = catchAll;
