'use strict';

const template = require('../response');


function responseTemplate(request, response, next) {
	response.locals.template = template;
	next();
}


module.exports = responseTemplate;
