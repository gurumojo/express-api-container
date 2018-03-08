'use strict';

const template = require('../lib/response');


function responseTemplate(request, response, next) {
	response.locals.template = template;
	next();
}


module.exports = responseTemplate;
