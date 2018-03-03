'use strict';

const type = 'application/json; charset=utf-8';


function responseType(request, response, next) {
	response.type(type);
	next();
}


module.exports = responseType;
