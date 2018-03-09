'use strict';


function terminus(logger, namespace, response, error) {
	let template = response.locals.template;
	response.locals.body = {error};
	if (error.status) {
		logger.warn(namespace, {failure: error.message});
		Object.keys(template).reduce((object, type) => {
			return error.status === template[type].status ? template[type] : object;
		}, template.internalServerError).dispatch(response);
	} else {
		logger.error(namespace, {failure: error.stack});
		template.internalServerError.dispatch(response);
	}
}


module.exports = terminus;
