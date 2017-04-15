'use strict'
const process = require('process');
const winston = require('winston');
const {omit} = require('lodash');

const redact = require(`${__dirname}/../redact`);

const env = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({level: env})
		//new winston.transports.File({filename: 'error.log', level: 'error'})
	]
});

logger.cli();


function apply(level, message, meta) {
	logger.log(level, `${new Date().toISOString()} ${message}:`, redact(meta));
}

function debug(message, meta) {
	apply('debug', message, meta);
}

function error(message, meta) {
	apply('error', message, meta);
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


module.exports = {
	profile: winston.profile,
	level,
	debug,
	info,
	warn,
	error
};
