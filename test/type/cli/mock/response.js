'use strict';

function mockResponse(sandbox) {
	return {
		locals: {
			template: {
				badRequest: {
					dispatch: sandbox.stub(),
					status: 400
				},
				internalServerError: {
					dispatch: sandbox.stub(),
					status: 500
				},
				methodNotAllowed: {
					dispatch: sandbox.stub(),
					status: 405
				},
				ok: {
					dispatch: sandbox.stub(),
					status: 200
				}
			}
		}
	};
}

module.exports = mockResponse;
