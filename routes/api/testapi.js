'use strict';

const _ = require('lodash');
const passport = require('passport');
const winston = require('winston');
const appRoot = require('app-root-path');
const constants = require(appRoot + '/constants');
const jm = require('./utils/json-msg-util');
const multer = require('multer');
const service = require('./services/test-service');

module.exports = (app) => {
	let router = require('express').Router();
	console.log('testapi');

	function fun1(req,res,next) {
		console.log('fun1');
		next();
	}

	function fun2(req,res,next) {
		console.log('fun2');
		next();
	}

	router.get(['/t1'],[fun1,fun2], (req, res, next)=>{
		//res.send('testapi t1');
		//console.log('t1');
		//res.render('index',{user: req.user});
		//res.redirect('/t1');
		let a = service.getMessage();
		console.log(a);
		//next('a5');
		next();
		//return res.json(jm.success("{data:'data t1'}"));
	});

	router.get(['/t2/:id','/t3/:id'], (req, res, next)=>{
		let url = req.url;
		res.send('testapi '+url+'='+req.params.id);
		//console.log('t2');
		//res.redirect('/t2');
		//res.render('index',{user: req.user});
		//next();
		//return res.json(jm.success("{data:'data t2'}"));
	});

	router.get('/t1',(req, res, next)=>{
		res.send('testapi t1 router finish!');
		//console.log('testapi t1 router finish!');
	});

	router.use((a5, req, res, next) => {
		res.send('testapi a1 router finish!');
		//console.log('testapi t1 router finish!');
	});

	// catch 404 and forward to error handler
	router.use((req, res, next) => {
		res.status(404).json(jm.notFound());
	});

	// general error handler ....
	router.use((err, req, res, next) => {
		winston.error('[API ERROR](' + req.originalUrl + ') ' + err);
		res.status(500).json(jm.error(req.app.get('env') === 'dev' ? err : 'Error'));
	});

	return router;
};

