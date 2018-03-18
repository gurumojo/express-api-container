const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/route/handler/put-user', () => {

	const mockery = require('mockery');
	const sinon = require('sinon');
	const {partial} = require('lodash');

	const constant = require('../../../mock/constant');
	const mockLogger = require('../../../mock/logger');
	const mockResponse = require('../../../mock/response');
	const mockRequest = require('../../../mock/request');

	const subjectUnderTest = '../../../../../lib/route/handler/put-user';
	const moduleWhitelist = [subjectUnderTest, 'lodash'];

	let sandbox, logger, response, terminus, putUser;

	return {

		before() {
			sandbox = sinon.createSandbox();
			logger = mockLogger(sandbox);
			response = mockResponse(sandbox);
			request = mockRequest(sandbox);
			terminus = sandbox.stub();
			mockery.enable({useCleanCache: true});
			mockery.registerAllowables(moduleWhitelist);
			mockery.registerMock('../../constant', constant);
			mockery.registerMock('../../logger', logger);
			mockery.registerMock('./terminus', terminus);
			putUser = require(subjectUnderTest);
		},

		beforeEach() {
			request.data.one.resolves();
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
				assert.isFunction(putUser);
			},

			'throws on missing arguments'() {
				assert.throws(putUser);
				assert.throws(partial(putUser, {}));
			},

			'logs a debug message'() {
				putUser(request, response);
				sinon.assert.calledOnce(logger.debug);
			},

			'calls a templated response method'() {
				putUser(request, response).then(() =>
					sinon.assert.calledOnce(response.locals.template.ok.dispatch));
			},

			'calls terminus handler on failure'() {
				putUser(request, null).then(() =>
					sinon.assert.calledOnce(terminus));
			}
		}
	}
});
