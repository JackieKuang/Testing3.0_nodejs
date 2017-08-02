'use strict';

let service = {};

service.getMessage = () => {
	console.log('getMessage');
	let message = 'return nessage';

	return message;
}

module.exports = service;
