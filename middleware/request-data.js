'use strict';
const data = require('../library/data');


function requestData(request, response, next) {
	request.data = data;
	next();
}


module.exports = requestData;
