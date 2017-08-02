'use strict';

const winston = require('winston');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const constants = require('../constants');

const swaggerSpec = swaggerJSDoc({
	swaggerDefinition: {
		basePath: constants.ENDPOINT_API,
		info: { title: constants.APP.NAME + ' APIs', version: constants.APP.VERSION }
	},
	apis: [
		'./routes/api/api-*.js'
	]
});

module.exports = (app) => {
	app.use('/explorer', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
