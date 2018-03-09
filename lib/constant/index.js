'use strict';
const express = require('./express');
const guard = require('./guard');
const http = require('./http');
const jwt = require('./jwt');
const logger = require('./logger');
const oauth = require('./oauth');
const postgres = require('./postgres');
const redis = require('./redis');

const API_NAME = 'api';
const NODE_ENV = 'development';
const CPU_COUNT = require('os').cpus().length;
const HOSTNAME = require('os').hostname();
const environment = require(`../config/${NODE_ENV}`);
const freeze = require('../freeze');

const staticConfigg = Object.assign(
	{
		API_NAME,
		CPU_COUNT,
		HOSTNAME,
		NODE_ENV
	},
	express,
	guard,
	http,
	jwt,
	logger,
	oauth,
	postgres,
	redis,
	environment
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
	'NODE_ENV',
	'POSTGRES_HOST',
	'POSTGRES_PORT',
	'POSTGRES_DB',
	'POSTGRES_USER',
	'POSTGRES_PASSWORD',
	'REDIS_HOST',
	'REDIS_PASSWORD',
	'REDIS_PORT'
];

const dynamicConfig = runtimeConfig.reduce((override, member) => {
	override[member] = process.env[member] || staticConfigg[member]
	return override;
}, {});

module.exports = freeze(Object.assign(staticConfigg, dynamicConfig));
