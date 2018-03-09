const {camelCase} = require('lodash');

const handler = require('../../../../../lib/handler/index');

const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/handler/index', {

	'exports a collection of functions'() {
		Object.keys(handler).forEach(item => {
			assert.isFunction(handler[item]);
		});
	},

	'function names use camelCase'() {
		Object.keys(handler).forEach(item => {
			assert.equal(item, camelCase(item));
		});
	}
});
