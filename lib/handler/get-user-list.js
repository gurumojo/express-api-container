'use strict';
const {partial} = require('lodash');

const logger = require('../logger');
const {API_NAME} = require('../constant');
const {terminus} = require('../handler');

const namespace = `${API_NAME}.route.handler.get-user-list`;


function getUserList(request, response) {
	logger.debug(namespace, {auth: request.passport.user});
	return request.data.any(request.data.query.getUser, {where: ''})
	.then(list => {
		response.locals.body = list;
		response.locals.template.ok.dispatch(response);
	})
	.catch(partial(terminus, logger, namespace, response));
}


module.exports = getUserList;