const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/constant', () => {

	const {pick} = require('lodash');
	const {readdirSync, realpathSync} = require('fs');

	const subjectUnderTest = '../../../../lib/constant';

	const types = {
		number: [
			'CPU_COUNT',
			'POSTGRES_PORT',
			'REDIS_PORT'
		],
		object: [
			'LOGGER_BLACKLIST_OBJECT_MEMBER',
			'LOGGER_WHITELIST_EXPRESS_REQUEST',
			'LOGGER_WHITELIST_EXPRESS_RESPONSE'
		],
		string: [
			'API_NAME',
			'HOSTNAME',
			'NODE_ENV'
		]
	};

	let constant, directory, files;

	return {

		'imports declarations': {

			before() {
				constant = require(subjectUnderTest);
				directory = realpathSync(`${__dirname}/${subjectUnderTest}`);
				files = readdirSync(directory).reduce((list, item) => {
					if (item.indexOf('.json') !== -1) {
						list.push(item);
					}
					return list;
				}, []);
			},

			tests: {

				'directory has files'() {
					assert.isNotEmpty(files);
				},

				'files are valid JSON'() {
					files.map(fileName => {
						let object = null;
						try {
							object = require(`${directory}/${fileName}`);
						} catch (e) { }
						assert.exists(object);
					});
				}
			}
		},

		// TODO: walk tree to confirm _every_ leaf is a primitive

		'exports a collection of primitives': {

			'some are numbers'() {
				types.number.forEach(item => {
					assert.isNumber(constant[item]);
				});
			},

			'some are strings'() {
				types.string.forEach(item =>
					assert.isString(constant[item]));
			}
		},

		'members of the collection are immutable': {

			'top-level nodes'() {
				[].concat(types.number, types.string).forEach(item =>
					assert.isFalse(delete constant[item]));
			},

			'sub-level nodes'() {
				types.object.forEach(item =>
					assert.isFrozen(constant[item]));
			}
		}
	};
});
