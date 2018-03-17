'use strict';

function mockRequest(sandbox) {
	return {
		data: {
			any: sandbox.stub(),
			one: sandbox.stub(),
			query: {
				getUser: sandbox.stub()
			}
		},
		params: {
			entityID: '00000000-0000-0000-0000-000000000000'
		}
	};
}

module.exports = mockRequest;
