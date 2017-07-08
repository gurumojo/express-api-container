'use strict';
const constant = require('../library/constant');
const data = require('../library/data');
const logger = require('../library/logger');


function requestData(request, response, next) {
	logger.debug(`${constant.EXPRESS_HOST}.request.data`, {attached: true});
	request.data = data;
	next();
}


module.exports = requestData;
