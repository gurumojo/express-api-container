const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/handler/catch-all', () => {

	const mockery = require('mockery');
	const sinon = require('sinon');
	const {partial} = require('lodash');

	const constant = require('../../../mock/constant');
	const mockLogger = require('../../../mock/logger');
	const mockResponse = require('../../../mock/response');

	const subjectUnderTest = '../../../../../lib/route/handler/catch-all';
	const moduleWhitelist = [subjectUnderTest];

	let sandbox, logger, response, catchAll;

	return {

		before() {
			sandbox = sinon.createSandbox();
			logger = mockLogger(sandbox);
			response = mockResponse(sandbox);
			mockery.enable({useCleanCache: true});
			mockery.registerAllowables(moduleWhitelist);
			mockery.registerMock('../../constant', constant);
			mockery.registerMock('../../logger', logger);
			catchAll = require(subjectUnderTest);
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
				assert.isFunction(catchAll);
			},

			'throws on missing arguments'() {
				assert.throws(catchAll);
				assert.throws(partial(catchAll, {}));
			},

			'logs a warning'() {
				catchAll(response, {});
				sinon.assert.calledOnce(logger.warn);
			},

			'calls a templated response method'() {
				catchAll(response, {});
				sinon.assert.calledOnce(
					response.locals.template.methodNotAllowed.dispatch);
			}
		}
	}
});
