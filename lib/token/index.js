'use strict';
const discover = require('../discover');
const logger = require('../logger');
const {API_NAME} = require('../constant');

const namespace = `${API_NAME}.token`;

logger.debug(namespace, {discover: true});

module.exports = discover(__dirname).reduce((object, member) => {
	logger.debug(namespace, {member: member.name});
	object[member.name] = require(member.module);
	return object;
}, {});
