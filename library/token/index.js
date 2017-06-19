'use strict';
const constant = require('../constant');
const discover = require('../discover');
const logger = require('../logger');

logger.debug(`${constant.EXPRESS_HOST}.token`, {discover: true});

module.exports = discover(__dirname).reduce((object, member) => {
	logger.debug(`${constant.EXPRESS_HOST}.token`, {member: member.name});
	object[member.name] = require(member.module);
	return object;
}, {});
