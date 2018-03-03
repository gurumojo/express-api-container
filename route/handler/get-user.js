'use strict';
const Promise = require('bluebird');
const {pick} = require('lodash');

const json = require('../../library/json');
const logger = require('../../library/logger');
const template = require('../../library/response');
const time = require('../../library/time');
const {API_NAME} = require('../../library/constant');
const {serverError} = require('../../library/handler');

const entityWhitelist = [
	'id',
	'uuid',
	'created',
	'updated'
];

const namespace = `${API_NAME}.route.handler.get-user`;


function buildUser(entity, profile) {
	let account = pick(entity, entityWhitelist);
	return Object.assign(account, profile, time.resolve(account, profile));
}

function getUser(request, response) {
	let db = request.data;
	let id = request.params.entityID;
	return Promise.all([
		db.one(db.query.getEntity, {id}),
		db.one(db.query.getProfile, {entityID: id})
	])
	.then(([entity, profile]) => {
		response.locals.body = buildUser(entity, profile);
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
