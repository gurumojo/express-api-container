const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/discover', () => {

	const mockery = require('mockery');
	const sinon = require('sinon');
	const {clone, partial, pick} = require('lodash');

	const constant = require('../mock/constant');
	const mockLogger = require('../mock/logger');
	const mockFS = require('../mock/fs');

	const subjectUnderTest = '../../../lib/discover';
	const moduleWhitelist = [subjectUnderTest, 'lodash', 'path'];

	const files = ['.', '.git', 'LICENSE', 'info.json', 'server.js'];
	// files prepended w/ namespace '/' in below test implementation
	const slashDot = /^\/\./; // match on hidden files
	const jsonExt = /\.json$/; // end with ".json"
	const jsExt = /\.js$/; // end with ".js"

	let sandbox, logger, fs, discover;

	return {

		before() {
			sandbox = sinon.createSandbox();
			fs = mockFS(sandbox);
			logger = mockLogger(sandbox);
			mockery.enable({useCleanCache: true});
			mockery.registerAllowables(moduleWhitelist);
			mockery.registerMock('./constant', constant);
			mockery.registerMock('./logger', logger);
			mockery.registerMock('fs', fs);
			discover = require(subjectUnderTest);
		},

		beforeEach() {
			fs.readdirSync.returns(clone(files));
			fs.realpathSync.returns('fs')
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
				assert.isFunction(discover);
			},

			'throws on invalid argument type': {

				'array'() {
					assert.throws(partial(discover, []));
				},

				'null'() {
					assert.throws(partial(discover, null));
				},

				'object'() {
					assert.throws(partial(discover, {}));
				}
			},

			'returns module metadata': {

				'prefers string path argument'() {
					assert.isNotEmpty(discover('./lib'));
				},

				'accepts undefined path argument'() {
					assert.isNotEmpty(discover());
				},

				'skips hidden files'() {
					for (file in discover()) {
						assert.isNull(file.match(slashDot));
					}
				},

				'includes *.json files'() {
					const collection = discover();
					const json = Object.keys(collection).reduce((list, file) => {
						const match = collection[file].path.match(jsonExt);
						if (match) list.push(file);
						return list;
					}, []);
					assert.lengthOf(json, 1);
				},

				'includes *.js files'() {
					const collection = discover();
					const js = Object.keys(collection).reduce((list, file) => {
						const match = collection[file].path.match(jsExt);
						if (match) list.push(file);
						return list;
					}, []);
					assert.lengthOf(js, 1);
				}
			},

			'returns instantiated modules': {

				'not by default'() {
					const collection = discover('./lib');
					sinon.assert.notCalled(fs.realpathSync);
				},

				'with load argument true'() {
					const collection = discover('./lib', true);
					sinon.assert.calledThrice(fs.realpathSync);
				}
			}
		}
	}
});
