'use strict';
const status = require('express')();

status.disable('etag');
status.disable('x-powered-by');

status.get('/', (request, response) => {
	response.send({status: 'OK'});
});

module.exports = status;
