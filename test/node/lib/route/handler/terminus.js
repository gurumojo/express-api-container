const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/handler/terminus', () => {

	const sinon = require('sinon');
	const {partial} = require('lodash');

	const mockLogger = require('../../../mock/logger');
	const mockResponse = require('../../../mock/response');

	const subjectUnderTest = '../../../../../lib/route/handler/terminus';

	const extendedError = {message: 'extendedErrorMock', stack: 'extendedErrorStack', status: 400};
	const rawError = {message: 'rawErrorMock', stack: 'rawErrorStack'};

	const namespace = 'intern.test';

	let sandbox, logger, response, terminus;

	return {

		before() {
			sandbox = sinon.createSandbox();
			logger = mockLogger(sandbox);
			response = mockResponse(sandbox);
			terminus = require(subjectUnderTest);
		},

		beforeEach() {
		},

		afterEach() {
			sandbox.reset();
		},

		after() {
		},

		tests: {

			'exports a function'() {
				assert.isFunction(terminus);
			},

			'throws on missing arguments'() {
				assert.throws(terminus);
				assert.throws(partial(terminus, {}));
				assert.throws(partial(terminus, {}, {}));
				assert.throws(partial(terminus, {}, {}, {}));
			},

			'on unknown error': {

				'logs an error'() {
					terminus(logger, namespace, response, rawError);
					sinon.assert.calledOnce(logger.error);
				},

				'calls a templated response method'() {
					terminus(logger, namespace, response, rawError);
					sinon.assert.calledOnce(
						response.locals.template.internalServerError.dispatch);
				}
			},

			'on invalid status': {

				'logs an error'() {
					terminus(logger, namespace, response,
						Object.assign({status: 1000}, rawError));
					sinon.assert.calledOnce(logger.warn);
				},

				'calls a templated response method'() {
					terminus(logger, namespace, response,
						Object.assign({status: 1000}, rawError));
					sinon.assert.calledOnce(
						response.locals.template.internalServerError.dispatch);
				}
			},

			'on bad request': {

				'logs a warning'() {
					terminus(logger, namespace, response, extendedError);
					sinon.assert.calledOnce(logger.warn);
				},

				'calls a templated response method'() {
					terminus(logger, namespace, response, extendedError);
					sinon.assert.calledOnce(
						response.locals.template.badRequest.dispatch);
				}
			}
		}
	}
});
