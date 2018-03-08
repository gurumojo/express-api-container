'use strict';

function object(input) {
	let output = null;
	if (typeof input === 'string') {
		try {
			output = JSON.parse(input);
		} catch (x) { }
	}
	return output;
}

function pretty(input) {
	let output = '';
	if (typeof input === 'object') {
		try {
			output = JSON.stringify(input, null, '  ');
		} catch (x) { }
	}
	return output;
}

function string(input) {
	let output = '';
	if (typeof input === 'object') {
		try {
			output = JSON.stringify(input);
		} catch (x) { }
	}
	return output;
}

module.exports = {
	object,
	pretty,
	string
};
