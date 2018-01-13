'use strict';

const constant = require('./constant');

const status = Object.freeze({
	accepted: {
		code: constant.HTTP_STATUS_ACCEPTED,
		header: {'X-HTTP-Status-Location': undefined},
		message: 'The request was accepted for processing.',
		text: 'ACCEPTED'
	},
	badGateway: {
		code: constant.HTTP_STATUS_BAD_GATEWAY,
		header: {'X-HTTP-Gateway-Location': undefined},
		message: 'The proxy for this request was not found.',
		text: 'BAD_GATEWAY'
	},
	badRequest: {
		code: constant.HTTP_STATUS_BAD_REQUEST,
		message: 'The request was malformed. Consult API documentation.',
		text: 'BAD_REQUEST'
	},
	conflict: {
		code: constant.HTTP_STATUS_CONFLICT,
		message: 'The request conflicts with resource state rules.',
		text: 'CONFLICT'
	},
	created: {
		code: constant.HTTP_STATUS_CREATED,
		header: {
			'Content-Type': undefined,
			'ETag': undefined,
			'Location': undefined
		},
		message: 'The requested resource was created.',
		text: 'CREATED'
	},
	forbidden: {
		code: constant.HTTP_STATUS_FORBIDDEN,
		header: {'X-HTTP-Permission-Required': undefined},
		message: 'The requested resource requires more priviledge.',
		text: 'FORBIDDEN'
	},
	gatewayTimeout: {
		code: constant.HTTP_STATUS_GATEWAY_TIMEOUT,
		header: {'X-HTTP-Gateway-Location': undefined},
		message: 'The proxy for this request failed to respond.',
		text: 'GATEWAY_TIMEOUT'
	},
	gone: {
		code: constant.HTTP_STATUS_GONE,
		message: 'The requested resource was removed.',
		text: 'GONE'
	},
	internalServerError: {
		code: constant.HTTP_STATUS_INTERNAL_SERVER_ERROR,
		message: 'The service encountered an unexpected exception.',
		text: 'INTERNAL_SERVER_ERROR'
	},
	methodNotAllowed: {
		code: constant.HTTP_STATUS_METHOD_NOT_ALLOWED,
		header: {'Allow': undefined},
		message: 'The requested method is not allowed for this route.',
		text: 'METHOD_NOT_ALLOWED'
	},
	nonauthoritativeInformation: {
		code: constant.HTTP_STATUS_NONAUTHORITATIVE_INFORMATION,
		header: {'X-HTTP-Information-Source': undefined},
		message: 'The request was fulfilled with non-authoritative information.',
		text: 'NONAUTHORITATIVE_INFORMATION'
	},
	notAcceptable: {
		code: constant.HTTP_STATUS_NOT_ACCEPTABLE,
		header: {'Content-Type': undefined},
		message: 'The requested response type is not available.',
		text: 'NOT_ACCEPTABLE'
	},
	notFound: {
		code: constant.HTTP_STATUS_NOT_FOUND,
		message: 'The requested resource does not seem to exist.',
		text: 'NOT_FOUND'
	},
	noContent: {
	 	code: constant.HTTP_STATUS_NO_CONTENT,
	 	message: 'The request succeeded without returning anything.',
	 	text: 'NO_CONTENT'
	},
	ok: {
		code: constant.HTTP_STATUS_OK,
		message: 'The request succeeded.',
		text: 'OK'
	},
	requestTimeout: {
		code: constant.HTTP_STATUS_REQUEST_TIMEOUT,
		message: 'The requested resource timed out before returning a response.',
		text: 'REQUEST_TIMEOUT'
	},
	resetContent: {
		code: constant.HTTP_STATUS_RESET_CONTENT,
		message: 'The request succeeded. Reset form inputs.',
		text: 'RESET_CONTENT'
	},
	serviceUnavailable: {
		code: constant.HTTP_STATUS_SERVICE_UNAVAILABLE,
		header: {'Retry-After': undefined},
		message: 'The requested service is currently unavailable. Try again later.',
		text: 'SERVICE_UNAVAILABLE'
	},
	unauthorized: {
		code: constant.HTTP_STATUS_UNAUTHORIZED,
		header: {'WWW-Authenticate': undefined},
		message: 'The requested resource is not allowed without authentication.',
		text: 'UNAUTHORIZED'
	}
});

module.exports = status;
