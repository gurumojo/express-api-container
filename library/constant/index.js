'use strict';
const express = require('./express');
const logger = require('./logger');
const redis = require('./redis');

const environment = process.env.NODE_ENV || 'development';
const hostname = process.env.EXPRESS_HOST || 'express-api';

const override = require(`./${environment}`);

module.exports = Object.freeze(Object.assign(
	{
		environment,
		hostname
	},
	express,
	logger,
	redis,
	override
));
