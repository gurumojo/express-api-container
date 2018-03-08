'use strict';

const os = require('os');

/*
os.networkInterfaces()

{ lo: 
   [ { address: '127.0.0.1',
       netmask: '255.0.0.0',
       family: 'IPv4',
       mac: '00:00:00:00:00:00',
       internal: true },
     { address: '::1',
       netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
       family: 'IPv6',
       mac: '00:00:00:00:00:00',
       scopeid: 0,
       internal: true } ],
  docker0: 
   [ { address: '172.17.0.1',
       netmask: '255.255.0.0',
       family: 'IPv4',
       mac: '02:42:a1:94:6f:0c',
       internal: false },
     { address: 'fe80::42:a1ff:fe94:6f0c',
       netmask: 'ffff:ffff:ffff:ffff::',
       family: 'IPv6',
       mac: '02:42:a1:94:6f:0c',
       scopeid: 4,
       internal: false } ] }
*/

function filter(net, ip) {
	if (ip.family === 'IPv4') {
		net.push(ip.address);
	}
	return net;
}

function network() {
  const interfaces = os.networkInterfaces();
  const list = [];
  for (let x in interfaces) {
  	interfaces[x].reduce(filter, list);
  }
  return list;
}

module.exports = network;
