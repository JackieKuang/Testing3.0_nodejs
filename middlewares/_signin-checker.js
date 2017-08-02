'use strict';

const _ = require('lodash');
const appRoot = require('app-root-path');

const constants = require(appRoot + '/constants');
const jm = require(appRoot + '/routes/api/utils/json-msg-util');

const DEFAULT_MAIN_PATH = '/';
const DEFAULT_SIGNIN_PATH = '/signin';

let checker = {}

checker.apiCheck = (req, res, next) => {
	return req.isAuthenticated() ? next() : res.json(jm.unauthorized());
}

checker.check = (req, res, next) => {
	return req.isAuthenticated() ? next() : res.redirect(DEFAULT_MAIN_PATH);
}

module.exports = checker;
