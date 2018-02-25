'use strict';
const Promise = require('bluebird');

const constant = require('../../library/constant');
const data = require('../../library/data');
const logger = require('../../library/logger');
const {serverError} = require('../../library/handler');

const entityFields = [
	'id',
	'uuid',
	'created',
	'updated'
];

const namespace = `${constant.API_NAME}.route.handler.get-user`;


function getUser(request, response) {
	return Promise.all([
		data.one(data.query.getEntity, {entity: request.params.entity}),
		data.one(data.query.getProfile, {entity: request.params.entity})
	])
	.then(([entity, profile]) => Object.assign(profile, pick(entity, entityFields)))
	.catch(x => {
		if (x.status) {
			logger.warn(namespace, {failure: x.message});
			response.set(x.headers).status(x.status).send(x.body);
		} else {
			serverError(response, x);
		}
	});
}


module.exports = getUser;
