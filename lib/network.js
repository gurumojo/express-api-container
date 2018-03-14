'use strict';
const {networkInterfaces} = require('os');


function omitLocalhost(net, ip) {
	if (ip.address !== '127.0.0.1') {
		net.push(ip.address);
	}
	return net;
}

function pluckIPv4(net, ip) {
	if (ip.family === 'IPv4') {
		net.push(ip.address);
	}
	return net;
}

function host() {
	return interfaces().reduce(omitLocalhost, []).pop() || '0.0.0.0';
}

function interfaces() {
  const network = networkInterfaces();
  const list = [];
  let address;
  for (address in network) {
  	network[address].reduce(pluckIPv4, list);
  }
  return list;
}


module.exports = {
	host,
	interfaces
}
