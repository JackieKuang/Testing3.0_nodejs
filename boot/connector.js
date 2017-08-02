'use strict';

const winston = require('winston');
const path = require('path');
const appRoot = require('app-root-path');

module.exports = (app) => {
	require(appRoot + '/services/db-service');
};

