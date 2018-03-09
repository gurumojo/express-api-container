'use strict';
const discover = require('../discover');


module.exports = discover(__dirname).reduce((object, member) => {
	object[member.name] = require(member.module);
	return object;
}, {});
