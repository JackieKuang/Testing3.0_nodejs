'use strict';

const _ = require('lodash');

module.exports.MESSAGES = {
	200: 'OK',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Signed Already',
	404: 'Not Found',
	500: 'Error'
};
module.exports.CODES = {
	OK: 200,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	SIGNED_ALREADY: 402,
	NOT_FOUND: 404,
	ERROR: 500
};


let _msg = (data, message, code) => {
	let res = {
		code: code || 200,
		message: message || this.MESSAGES[(code || 200)] || '',
		data: data
	};
	return res;
}

module.exports = {
	success: (data, message='OK', code=200) => {
		if(!_.isNumber(code) || code < 200 || code > 399) code = 200;
		return _msg(data, message, code);
	},

	error: (data, message='Error', code=500) => {
		if(!_.isNumber(code) || code < 400 || code > 999) code = 500;
		return _msg(data, message, code);
	},

	badRequest: (message) => {
		let code = this.CODES.BAD_REQUEST;
		return _msg({}, message || this.MESSAGES[code], code);
	},

	unauthorized: (message) => {
		let code = this.CODES.UNAUTHORIZED;
		return _msg({}, message || this.MESSAGES[code], code);
	},

	signedAlready: (message) => {
		let code = this.CODES.SIGNED_ALREADY;
		return _msg({}, message || this.MESSAGES[code], code);
	},

	notFound: (message) => {
		let code = this.CODES.NOT_FOUND;
		return _msg({}, message || this.MESSAGES[code], code);
	}
}
