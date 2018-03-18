const {assert} = intern.getPlugin('chai');
const {registerSuite} = intern.getInterface('object');

registerSuite('lib/config', () => {

	const {readdirSync, realpathSync} = require('fs');

	const subjectUnderTest = '../../../lib/config';

	let directory, files;

	return {

		before() {
			directory = realpathSync(`${__dirname}/${subjectUnderTest}`);
			files = readdirSync(directory).reduce((list, item) => {
				if (item.indexOf('.') !== 0) {
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
	};
});
