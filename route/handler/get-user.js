'use strict';
const Promise = require('bluebird');
const {pick} = require('lodash');

const template = require('../../library/response');
const json = require('../../library/json');
const logger = require('../../library/logger');
const {API_NAME} = require('../../library/constant');
const {serverError} = require('../../library/handler');

const entityFields = [
	'id',
	'uuid',
	'created',
	'updated'
];

const namespace = `${API_NAME}.route.handler.get-user`;


function getUser(request, response) {
	let db = request.data;
	return Promise.all([
		db.one(db.query.getEntity, {entity: request.params.entity}),
		db.one(db.query.getProfile, {entity: request.params.entity})
	])
	.then(([entity, profile]) => {
		response.locals.body = Object.assign(profile, pick(entity, entityFields));
		template.ok.dispatch(response);
	})
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
