'use strict';
const path = require('path');
const read = require('require-all');
const {camelCase} = require('lodash');

const main = path.basename(__filename);

const regex = /^[^\.].*/;


function rename(file) {
	return camelCase(path.basename(file, path.extname(file)));
}

function filter(file) {
	if (file !== main) {
		let match = file.match(regex);
		return match ? rename(file) : null;
	}
}


module.exports = read({dirname: __dirname, filter});
