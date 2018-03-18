const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/handler/get-user-list', () => {

	const mockery = require('mockery');
	const sinon = require('sinon');
	const {partial} = require('lodash');

	const constant = require('../../../mock/constant');
	const mockLogger = require('../../../mock/logger');
	const mockResponse = require('../../../mock/response');
	const mockRequest = require('../../../mock/request');

	const subjectUnderTest = '../../../../../lib/route/handler/get-user-list';
	const moduleWhitelist = [subjectUnderTest, 'lodash'];

	let sandbox, logger, response, terminus, getUserList;

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
			getUserList = require(subjectUnderTest);
		},

		beforeEach() {
			request.data.any.resolves();
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
				assert.isFunction(getUserList);
			},

			'throws on missing arguments'() {
				assert.throws(getUserList);
				assert.throws(partial(getUserList, {}));
			},

			'logs a debug message'() {
				getUserList(request, response);
				sinon.assert.calledOnce(logger.debug);
			},

			'calls a templated response method'() {
				getUserList(request, response).then(() =>
					sinon.assert.calledOnce(response.locals.template.ok.dispatch));
			},

			'calls terminus handler on failure'() {
				getUserList(request, null).then(() =>
					sinon.assert.calledOnce(terminus));
			}
		}
	}
});
