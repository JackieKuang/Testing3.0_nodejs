'use strict';

const constants = require('../constants');

const API_ROUTES = [
	//{ route: '/meta', 			path: './api/api-meta' }
];

module.exports = (app) => {
	app.use('/', require('./action')(app));

	// for ENDPOINT_API
	API_ROUTES.map((route) => {
		app.use(constants.ENDPOINT_API + route.route, require(route.path)(app));
	});
};
