const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/handler/server-error', () => {

	const mockery = require('mockery');
	const sinon = require('sinon');
	const {partial} = require('lodash');

	const constant = require('../../mock/constant');
	const mockLogger = require('../../mock/logger');
	const mockResponse = require('../../mock/response');

	const subjectUnderTest = '../../../../../lib/handler/server-error';
	const moduleWhitelist = [subjectUnderTest];

	let sandbox, logger, response, serverError;

	return {

		before() {
			sandbox = sinon.createSandbox();
			logger = mockLogger(sandbox);
			response = mockResponse(sandbox);
			mockery.enable({useCleanCache: true});
			mockery.registerAllowables(moduleWhitelist);
			mockery.registerMock('../constant', constant);
			mockery.registerMock('../logger', logger);
			serverError = require(subjectUnderTest);
		},

		beforeEach() {
		},

		afterEach() {
			sandbox.reset();
		},

		after() {
			mockery.deregisterAll();
			mockery.disable();
		},

		tests: {

			'exports a function'() {
				assert.isFunction(serverError);
			},

			'throws on missing arguments'() {
				assert.throws(serverError);
				assert.throws(partial(serverError, {}));
			},

			'logs an error'() {
				serverError(response, {});
				sinon.assert.calledOnce(logger.error);
			},

			'calls a templated response method'() {
				serverError(response, {});
				sinon.assert.calledOnce(
					response.locals.template.internalServerError.dispatch);
			}
		}
	}
});
