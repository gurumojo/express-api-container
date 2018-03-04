'use strict';
const moment = require('moment');


function between(a, b, c) {
	return moment(c).isBetween(a, b, null, '[]');
}

function diff(a, b) {
	return moment(a).diff(b);
}

function first(list) {
	return moment.min(list.map(x => moment(x)));
}

function last(list) {
	return moment.max(list.map(x => moment(x)));
}

function resolve(a, b) {
	return {
		created: first([a.created, b.created]),
		updated: last([a.updated, b.updated])
	};
}

function string(time) {
	return moment(time).toISOString();
}


module.exports = {
	between,
	diff,
	first,
	last,
	resolve,
	string
};
