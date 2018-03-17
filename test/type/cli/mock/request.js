'use strict';

function mockRequest(sandbox) {
	return {
		data: {
			any: sandbox.stub(),
			query: {
				getUser: sandbox.stub()
			}
		}
	};
}

module.exports = mockRequest;
