'use strict';

function mockFS(sandbox) {
	return {
		readdirSync: sandbox.stub(),
		realpathSync: sandbox.stub()
	};
}

module.exports = mockFS;
