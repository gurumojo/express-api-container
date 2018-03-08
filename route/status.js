'use strict';
const status = require('../lib/router')();

status.get('/', (request, response) => {
	response.send({status: 'OK'});
});

module.exports = status;
