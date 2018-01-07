'use strict';
const express = require('./express');
const http = require('./http');
const jwt = require('./jwt');
const logger = require('./logger');
const oauth = require('./oauth');
const postgres = require('./postgres');
const redis = require('./redis');

const API_NAME = process.env.API_NAME || 'api';
const HOSTNAME = require('os').hostname();
const NODE_ENV = process.env.NODE_ENV || 'development';
const environment = require(`../config/${NODE_ENV}`);

const staticConfig = Object.assign(
	{
		API_NAME,
		HOSTNAME,
		NODE_ENV
	},
	express,
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
	'EXPRESS_HOST',
	'EXPRESS_PORT',
	'JWT_CLOCK_TOLERANCE',
	'JWT_EXPIRES_IN',
	'JWT_MAX_AGE',
	'JWT_SECRET',
	'POSTGRES_HOST',
	'POSTGRES_PASSWORD',
	'POSTGRES_PORT',
	'REDIS_HOST',
	'REDIS_PASSWORD',
	'REDIS_PORT'
];

const dynamicConfig = runtimeConfig.reduce((override, member) => {
	override[member] = process.env[member] || staticConfig[member]
	return override;
}, {});

module.exports = Object.freeze(Object.assign(staticConfig, dynamicConfig));
