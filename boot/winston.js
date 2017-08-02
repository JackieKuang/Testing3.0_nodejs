'use strict';
const winston = require('winston');

module.exports = (app) => {
	winston.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';
	winston.info('[' + app.NAME + '] --> Log level:', winston.level);
};

