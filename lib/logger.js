'use strict'
const hostname = require('os').hostname();
const winston = require('winston');

const redact = require('./redact');

const logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({level: logLevel})
		//new winston.transports.File({filename: 'error.log', level: 'error'})
	]
});

let metadata = null;
const system = {hostname};

function apply(level, namespace, data) {
	logger.log(level, `${new Date().toISOString()} ${metadata} ${namespace}:`, redact(data));
}

function debug(message, meta) {
	apply('debug', message, meta);
}

function error(message, meta) {
	apply('error', message, meta);
}

function meta(data) {
	metadata = JSON.stringify(Object.assign({}, system, data));
}

function info(message, meta) {
	apply('info', message, meta);
}

function level(option) {
	logger.transports.console.level = option;
}

function warn(message, meta) {
	apply('warn', message, meta);
}


logger.cli();
meta();

module.exports = {
	profile: winston.profile,
	level,
	debug,
	info,
	meta,
	warn,
	error
};
