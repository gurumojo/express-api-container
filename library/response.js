'use strict';
const {defaultsDeep, partial, template} = require('lodash');

const freeze = require('./freeze');
const json = require('./json');
const status = require('./status');

const base = '{"body":<%print(json.string(body))%>,"headers":<%print(json.string(headers))%>,"status":<%print(status)%>}';

const make = template(base, {imports: {json}});


function dispatch(body, headers, status, response) {
	response.set(Object.assign({}, headers, response.locals.headers))
	.status(status)
	.send(defaultsDeep(response.locals.body, body));
}

function factory(object, member) {
	object[member] = json.object(make(status[member]));
	object[member].dispatch = partial(dispatch,
		object[member].body, object[member].headers, object[member].status);
	return object;
}


module.exports = freeze(Object.keys(status).reduce(factory, {}));
