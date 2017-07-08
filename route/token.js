'use strict';
const passport = require('../library/token/passport');
const token = require('../library/router')();


token.get('/',
	passport.authenticate('jwt-refresh', {session: false}),
	(request, response) => response.send({token: response.locals.token})
);

token.post('/',
	passport.authenticate('local', {session: false}),
	(request, response) => response.send({token: response.locals.token})
);


module.exports = token;
