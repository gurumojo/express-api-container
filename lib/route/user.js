'use strict';
const getUser = require('./handler/get-user');
const getUserList = require('./handler/get-user-list');
const putUser = require('./handler/put-user');

const user = require('./factory')();


user.get('/:entityID', getUser);

user.get('/', getUserList);

user.put('/', putUser);


module.exports = user;
