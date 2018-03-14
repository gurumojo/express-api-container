'use strict';
const token = require('./factory')();
const {passport} = require('../token');


token.get('/',
	passport.authenticate('jwt-refresh'),
	//(request, response) => response.send({token: response.locals.token})
	(request, response) => response.set({
		'x-access-token': response.locals.token.access,
		'x-refresh-token': response.locals.token.refresh
	}).status(204).send()
	//.send({token: response.locals.token})
);

token.put('/',
	passport.authenticate('local'),
	//(request, response) => response.send({token: response.locals.token})
	(request, response) => response.set({
		'x-access-token': response.locals.token.access,
		'x-refresh-token': response.locals.token.refresh
	}).status(204).send()
	//.send({token: response.locals.token})
);


module.exports = token;
