'use strict';
const requireAll = require('require-all');

const {cpus, hostname} = require('os');
const {readdirSync} = require('fs');
const environment = process.env.NODE_ENV || 'development';

const config = require(`../config/${environment}`);
const freeze = require('../freeze');

const {
	express,
	http,
	jwt,
	logger,
	postgres,
	redis,
	security
} = requireAll(__dirname);


const staticConfig = Object.assign(
	{
		API_NAME: 'api',
		CPU_COUNT: cpus().length,
		HOSTNAME: hostname(),
		NODE_ENV: environment
	},
	express,
	http,
	jwt,
	logger,
	postgres,
	redis,
	security,
	config
);

const runtimeConfig = [
	'API_NAME',
	'CPU_COUNT',
	'EXPRESS_HOST',
	'EXPRESS_PORT',
	'HOSTNAME',
	'JWT_CLOCK_TOLERANCE',
	'JWT_EXPIRES_IN',
	'JWT_MAX_AGE',
	'JWT_SECRET',
	'POSTGRES_HOST',
	'POSTGRES_PORT',
	'POSTGRES_DB',
	'POSTGRES_USER',
	'POSTGRES_PASSWORD',
	'REDIS_HOST',
	'REDIS_PASSWORD',
	'REDIS_PORT'
];

// TODO: cast to expected types on dynamic input

const dynamicConfig = runtimeConfig.reduce((override, member) => {
	override[member] = process.env[member] || staticConfig[member]
	return override;
}, {});

module.exports = freeze(Object.assign(staticConfig, dynamicConfig));
