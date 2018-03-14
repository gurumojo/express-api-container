'use strict';


function freeze(input) {
	let object = null;
	try {
		object = Object.freeze(Object.keys(input).reduce((o, m) => {
			o[m] = input[m] && typeof input[m] === 'object'
				? freeze(input[m])
				: input[m];
			return o;
		}, {}));
	} catch (x) { }
	return object;
}


module.exports = freeze;
