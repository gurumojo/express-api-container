'use strict';
const constant = require('./constant');


module.exports = Object.freeze({
	accepted: {
		success: {
			code: constant.HTTP_STATUS_ACCEPTED,
			description: 'The request was accepted for processing.',
			message: 'ACCEPTED'
		}
	},
	badGateway: {
		error: {
			code: constant.HTTP_STATUS_BAD_GATEWAY,
			description: 'The proxy for this request was not found.',
			message: 'BAD_GATEWAY'
		}
	},
	badRequest: {
		error: {
			code: constant.HTTP_STATUS_BAD_REQUEST,
			description: 'The request was malformed. Consult API documentation for help.',
			message: 'BAD_REQUEST'
		}
	},
	conflict: {
		error: {
			code: constant.HTTP_STATUS_CONFLICT,
			description: 'The request conflicts with current resource state.',
			message: 'CONFLICT'
		}
	},
	created: {
		success: {
			code: constant.HTTP_STATUS_CREATED,
			description: 'The requested resource was created.',
			message: 'CREATED'
		}
	},
	forbidden: {
		error: {
			code: constant.HTTP_STATUS_FORBIDDEN,
			description: 'The requested resource requires more priviledge.',
			message: 'FORBIDDEN'
		}
	},
	gatewayTimeout: {
		error: {
			code: constant.HTTP_STATUS_GATEWAY_TIMEOUT,
			description: 'The proxy for this request failed to respond.',
			message: 'GATEWAY_TIMEOUT'
		}
	},
	internalServerError: {
		error: {
			code: constant.HTTP_STATUS_INTERNAL_SERVER_ERROR,
			description: 'The service encountered an unexpected exception.',
			message: 'INTERNAL_SERVER_ERROR'
		}
	},
	methodNotAllowed: {
		error: {
			code: constant.HTTP_STATUS_METHOD_NOT_ALLOWED,
			description: 'The requested method is not allowed for this route.',
			message: 'METHOD_NOT_ALLOWED'
		}
	},
	notAcceptable: {
		error: {
			code: constant.HTTP_STATUS_NOT_ACCEPTABLE,
			description: 'The requested response type is not available.',
			message: 'NOT_ACCEPTABLE'
		}
	},
	notFound: {
		error: {
			code: constant.HTTP_STATUS_NOT_FOUND,
			description: 'The requested resource does not exist.',
			message: 'NOT_FOUND'
		}
	},
	noContent: {
		success: {
			code: constant.HTTP_STATUS_NO_CONTENT,
			description: 'The requested resource has no response object.',
			message: 'NO_CONTENT'
		}
	},
	ok: {
		success: {
			code: constant.HTTP_STATUS_OK,
			description: 'The requested resource was found.',
			message: 'OK'
		}
	},
	requestTimeout: {
		error: {
			code: constant.HTTP_STATUS_REQUEST_TIMEOUT,
			description: 'The requested resource timed out before returning a response.',
			message: 'REQUEST_TIMEOUT'
		}
	},
	serviceUnavailable: {
		error: {
			code: constant.HTTP_STATUS_SERVICE_UNAVAILABLE,
			description: 'The requested service is currently unavailable. Try again later.',
			message: 'SERVICE_UNAVAILABLE'
		}
	},
	unauthorized: {
		error: {
			code: constant.HTTP_STATUS_UNAUTHORIZED,
			description: 'The requested resource is not allowed without authentication.',
			message: 'UNAUTHORIZED'
		}
	}
});
