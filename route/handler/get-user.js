'use strict';
const {partial} = require('lodash');

const logger = require('../../library/logger');
const {API_NAME} = require('../../library/constant');
const {terminus} = require('../../library/handler');

const namespace = `${API_NAME}.route.handler.get-user`;


function getUser(request, response) {
	let id = {where: `WHERE e.id = ${request.params.entityID}`};
	return request.data.one(request.data.query.getUser, id)
	.then(user => {
		response.locals.body = user;
		response.locals.template.ok.dispatch(response);
	})
	.catch(partial(terminus, logger, namespace, response));
}


module.exports = getUser;
