const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/handler/index', () => {

	const {camelCase} = require('lodash');

	const subjectUnderTest = require('../../../../../lib/handler/index');

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
