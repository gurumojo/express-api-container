'use strict';

const constant = require('./constant');
const freeze = require('./freeze');

const status = freeze({
	accepted: {
		status: constant.HTTP_STATUS_ACCEPTED,
		headers: {'X-HTTP-Status-Location': null},
		body: {
			data: null,
			message: 'The request was accepted for processing.',
			status: 'ACCEPTED'
		}
	},
	badGateway: {
		status: constant.HTTP_STATUS_BAD_GATEWAY,
		headers: {'X-HTTP-Gateway-Location': null},
		body: {
			data: null,
			message: 'The proxy for this request was not found.',
			status: 'BAD_GATEWAY'
		}
	},
	badRequest: {
		status: constant.HTTP_STATUS_BAD_REQUEST,
		headers: null,
		body: {
			data: null,
			message: 'The request was malformed. Consult API documentation.',
			status: 'BAD_REQUEST'
		}
	},
	conflict: {
		status: constant.HTTP_STATUS_CONFLICT,
		headers: null,
		body: {
			data: null,
			message: 'The request conflicts with resource state rules.',
			status: 'CONFLICT'
		}
	},
	created: {
		status: constant.HTTP_STATUS_CREATED,
		headers: {
			'Content-Type': null,
			'ETag': null,
			'Location': null
		},
		body: {
			data: null,
			message: 'The requested resource was created.',
			status: 'CREATED'
		}
	},
	forbidden: {
		status: constant.HTTP_STATUS_FORBIDDEN,
		headers: {'X-HTTP-Permission-Required': null},
		body: {
			data: null,
			message: 'The requested resource requires more priviledge.',
			status: 'FORBIDDEN'
		}
	},
	gatewayTimeout: {
		status: constant.HTTP_STATUS_GATEWAY_TIMEOUT,
		headers: {'X-HTTP-Gateway-Location': null},
		body: {
			data: null,
			message: 'The proxy for this request failed to respond.',
			status: 'GATEWAY_TIMEOUT'
		}
	},
	gone: {
		status: constant.HTTP_STATUS_GONE,
		headers: null,
		body: {
			data: null,
			message: 'The requested resource was removed.',
			status: 'GONE'
		}
	},
	internalServerError: {
		status: constant.HTTP_STATUS_INTERNAL_SERVER_ERROR,
		headers: null,
		body: {
			data: null,
			message: 'The service encountered an unexpected exception.',
			status: 'INTERNAL_SERVER_ERROR'
		}
	},
	methodNotAllowed: {
		status: constant.HTTP_STATUS_METHOD_NOT_ALLOWED,
		headers: {'Allow': null},
		body: {
			data: null,
			message: 'The requested method is not allowed for this route.',
			status: 'METHOD_NOT_ALLOWED'
		}
	},
	nonauthoritativeInformation: {
		status: constant.HTTP_STATUS_NONAUTHORITATIVE_INFORMATION,
		headers: {'X-HTTP-Information-Source': null},
		body: {
			data: null,
			message: 'The request was fulfilled with non-authoritative information.',
			status: 'NONAUTHORITATIVE_INFORMATION'
		}
	},
	notAcceptable: {
		status: constant.HTTP_STATUS_NOT_ACCEPTABLE,
		headers: {'Content-Type': null},
		body: {
			data: null,
			message: 'The requested response type is not available.',
			status: 'NOT_ACCEPTABLE'
		}
	},
	notFound: {
		status: constant.HTTP_STATUS_NOT_FOUND,
		headers: null,
		body: {
			data: null,
			message: 'The requested resource does not seem to exist.',
			status: 'NOT_FOUND'
		}
	},
	noContent: {
	 	status: constant.HTTP_STATUS_NO_CONTENT,
		headers: null,
		body: null /* {
			data: null,
	 		message: 'The request succeeded without returning anything.',
	 		status: 'NO_CONTENT'
		} The 204 response MUST NOT include a message-body */
	},
	ok: {
		status: constant.HTTP_STATUS_OK,
		headers: null,
		body: {
			data: null,
			message: 'The request succeeded.',
			status: 'OK'
		}
	},
	requestTimeout: {
		status: constant.HTTP_STATUS_REQUEST_TIMEOUT,
		headers: null,
		body: {
			data: null,
			message: 'The requested resource timed out before returning a response.',
			status: 'REQUEST_TIMEOUT'
		}
	},
	resetContent: {
		status: constant.HTTP_STATUS_RESET_CONTENT,
		headers: null,
		body: null /* {
			data: null,
			message: 'The request succeeded. Reset form inputs.',
			status: 'RESET_CONTENT'
		} The 205 response MUST NOT include a message-body */
	},
	serviceUnavailable: {
		status: constant.HTTP_STATUS_SERVICE_UNAVAILABLE,
		headers: {'Retry-After': null},
		body: {
			data: null,
			message: 'The requested service is currently unavailable. Try again later.',
			status: 'SERVICE_UNAVAILABLE'
		}
	},
	unauthorized: {
		status: constant.HTTP_STATUS_UNAUTHORIZED,
		headers: {'WWW-Authenticate': null},
		body: {
			data: null,
			message: 'The requested resource is not allowed without authentication.',
			status: 'UNAUTHORIZED'
		}
	}
});

module.exports = status;
