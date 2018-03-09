#!/usr/bin/env node

'use strict';
const rp = require('request-promise');

rp('http://0.0.0.0:8000/status')
.then(x => console.log(JSON.parse(x).status))
.catch(e => {
	console.log(e.message);
	process.exit(1);
});
