'use strict';

module.exports = Object.freeze({
	APP: {
		NAME: 'Testing 3.0',
		VERSION: '1.0.0'
	},

	DEFAULT_TZ: '8',

	ENDPOINT_API: '/api',

	HASH_SALT: {
		HASH_TYPE: 'sha256',
		DEFAULT_SALT: '104',
		POSTFIX_SALT: '0'
	},

	FILE_PATH: {
	},

	SYS_OPTIONS: {
		'gender': [
			{label: '男', value: '1'},
			{label: '女', value: '0'}
		],
		'blood': [{label: 'A', value: 'A'}, 'B', 'O', 'AB'],
	}
});
