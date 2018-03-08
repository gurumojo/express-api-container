#!/usr/bin/env node
'use strict';
const cores = require('os').cpus().length;
const rp = require('request-promise');

const url = 'http://0.0.0.0:800';
const path = '/status';

Array(cores).fill(null, 0, cores)
.map((x, i) => rp(`${url}${i}${path}`)
	.then(console.log)
	.catch(e => console.log({status: e.message}))
);
