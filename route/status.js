'use strict';
const status = require('../library/router')();

status.get('/', (request, response) => {
	response.send({status: 'OK'});
});

module.exports = status;
