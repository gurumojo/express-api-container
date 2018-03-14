'use strict';
const status = require('./factory')();


status.get('/', (request, response) => {
	response.send({status: 'OK'});
});


module.exports = status;
