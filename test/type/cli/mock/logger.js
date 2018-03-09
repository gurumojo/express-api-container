'use strict';

function mockLogger(sandbox) {
	return {
		debug: sandbox.stub(),
		error: sandbox.stub(),
		info: sandbox.stub(),
		warn: sandbox.stub()
	};
}

module.exports = mockLogger;
