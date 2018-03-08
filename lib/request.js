'use strict';


function isStatusRoute(request) {
	return (request.path === '/status' || request.baseUrl === '/status');
}


module.exports = {
	isStatusRoute
};
