'use strict';
const logger = require('../library/logger');

const status = require('express')();

status.get('/', (request, response) => {
	response.send({status: 'OK'});
});

module.exports = status;
