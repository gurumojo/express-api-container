const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/route/handler/index', () => {

	const {camelCase} = require('lodash');

	const subjectUnderTest = require('../../../../../lib/route/handler/index');

	return {

		'exports a collection of functions'() {
			Object.keys(subjectUnderTest).forEach(item => {
				assert.isFunction(subjectUnderTest[item]);
			});
		},

		'function names use camelCase'() {
			Object.keys(subjectUnderTest).forEach(item => {
				assert.equal(item, camelCase(item));
			});
		}
	};
});
