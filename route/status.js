'use strict';
const router = require('express').Router();

router.get('/status', (request, response) => {
	response.send({status: 'OK'});
});

module.exports = router;
