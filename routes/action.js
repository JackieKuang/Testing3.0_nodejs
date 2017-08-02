'use strict';

const _ = require('lodash');
const winston = require('winston');
const appRoot = require('app-root-path');
const constants = require(appRoot + '/constants');
const sign = require('../middlewares/signin-checker');



module.exports = (app) => {
	let router = require('express').Router();

	router.get(['/'], (req, res, next) => {
		res.render('index', {user: req.user});
	});


	//----
	router.get(['/...', '/...'], sign.check, (req, res) => {
		res.render('index', {user: req.user});
	});

	return router;
};

