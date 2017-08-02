'use strict';

const _ = require('lodash');
const passport = require('passport');
const winston = require('winston');
const appRoot = require('app-root-path');
const constants = require(appRoot + '/constants');
const sign = require('../../middlewares/signin-checker');
const jm = require('./utils/json-msg-util');
const userService = require('./services/user-service');
const multer = require('multer');

let _delay = (req, res, next) => {
	setTimeout(next, 1000);
}

module.exports = (app) => {
	let router = require('express').Router();

	/**
	 * @swagger
	 * /profile/basic:
	 *   get:
	 *     tags:
	 *       - Profile
	 *     summary: 取得登入者基本資料(Basic)
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *     responses:
	 */
	router.get('/basic', sign.apiCheck, async (req, res, next) => {
		try{
			//let id = req.body.id;
			//if(!id) return res.json(jm.badRequest());

			//let result = await userService.getProfileBasic(req.user.id);
			let result = await userService.getProfileBasicByORM(req.user.id);
			return res.json(jm.success(result));
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/basic/update:
	 *   post:
	 *     tags:
	 *       - Profile
	 *     summary: 修改登入者基本資料
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
   	 *       - name: (body)
	 *         description: profile basic info
	 *         in: body
	 *         required: true
	 *         type: string
	 *         schema:
	 *           $ref: '#/definitions/profileBasic'
	 *     responses:
	 */
	router.post('/basic/update', sign.apiCheck, async (req, res, next) => {
		try{
			let user = req.body;
			//TODO: validate data type & format

			//let result = await userService.updateProfileBasic(req.user.id, user);
			let result = await userService.updateProfileBasicByORM(req.user.id, user);
			return res.json(jm.success(result));
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/project/list:
	 *   get:
	 *     tags:
	 *       - Profile
	 *     summary: 取得登入者全部專案經驗(project)
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *     responses:
	 */
	router.get('/project/list', sign.apiCheck, async (req, res, next) => {
		try{
			//let result = await userService.findProjects(req.user.id);
			let result = await userService.findProjectsByORM(req.user.id);
			return res.json(jm.success(result));
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/project/{id}:
	 *   get:
	 *     tags:
	 *       - Profile
	 *     summary: 取得project完整資料
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - name: id
	 *         description: project id
	 *         in: path
	 *         required: true
	 *         type: integer
	 *     responses:
	 */
	router.get('/project/:id', sign.apiCheck, async (req, res, next) => {
		try{
			let id = req.params.id * 1;
			if(_.isNaN(id)) return res.json(jm.badRequest('invalid id: "' + req.params.id + '"'));

			let result = await userService.getProject(id);
			return res.json(jm.success(result));
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/project/create:
	 *   post:
	 *     tags:
	 *       - Profile
	 *     summary: 建立登入者的project
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - name: (body)
	 *         description: project data
	 *         in: body
	 *         required: true
	 *         type: string
	 *         schema:
	 *           $ref: '#/definitions/profileProject'
	 *     responses:
	 */
	router.post('/project/create', sign.apiCheck, async (req, res, next) => {
		try{
			let project = req.body;
			// TODO: validate data type & format
			project.userId = req.user.id;

			//let result = await userService.createProject(project);
			let result = await userService.createProjectByORM(project);
			return res.json(jm.success(result));
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/project/update:
	 *   post:
	 *     tags:
	 *       - Profile
	 *     summary: 修改登入者的project
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - name: (body)
	 *         description: project data
	 *         in: body
	 *         required: true
	 *         type: string
	 *         schema:
	 *           $ref: '#/definitions/profileProject'
	 *     responses:
	 */
	router.post('/project/update', sign.apiCheck, async (req, res, next) => {
		try{
			let project = req.body;
			// TODO: validate data type & format

			//let result = await userService.updateProject(project);
			let result = await userService.updateProjectByORM(project);
			return res.json(jm.success(result));
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/project/{id}/delete:
	 *   post:
	 *     tags:
	 *       - Profile
	 *     summary: 刪除登入者的project
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - name: id
	 *         description: project id
	 *         in: path
	 *         required: true
	 *         type: integer
	 *     responses:
	 */
	router.post('/project/:id/delete', sign.apiCheck, async (req, res, next) => {
		try{
			let projectId = req.params.id * 1;
			if(_.isNaN(projectId)) return res.json(jm.badRequest('invalid project_id: "' + req.params.id + '"'));

			//await userService.deleteProject(projectId);
			await userService.deleteProjectByORM(projectId);
			return res.json(jm.success());
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/log/list:
	 *   get:
	 *     tags:
	 *       - Profile
	 *     summary: 取得登入者全部登入歷程記錄(log), 分段:50
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
   	 *       - name: cursor
	 *         description: cursor
	 *         in: query
	 *         required: false
	 *         type: integer
	 *     responses:
	 */
	router.get('/log/list', sign.apiCheck, async (req, res, next) => {
		try{
			let cursor = req.query.cursor * 1;
			if(_.isNaN(cursor) || cursor < 0) cursor = 0;

			let totalCount = await userService.getLogCount(req.user.id);
			let logs = await userService.getLogs(req.user.id, cursor);
			return res.json(jm.success(logs, {cursor: cursor + logs.length, total: totalCount}, 201));
		}
		catch(err){
			next(err);
		}
	});


	/**
	 * @swagger
	 * /profile/photo/upload:
	 *   post:
	 *     tags:
	 *       - Profile
	 *     summary: 上傳登入者照片
	 *     consumes:
	 *       - multipart/form-data
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - name: photo
	 *         description: photo file
	 *         in: formData
	 *         required: true
	 *         type: file
	 *     responses:
	 */
	const storeProfilePhoto = multer({
		dest: constants.FILE_PATH.PROFILE_PHOTO,
		limits: {
			files: 1,
			fileSize: 2 * 1024 * 1024
		}
	}).single('photo');
	router.post('/photo/upload', sign.apiCheck, storeProfilePhoto, async (req, res, next) => {
		try{
			if (_.isNil(req.file)) return res.json(jm.badRequest('invalid file'));

			let hash = await userService.uploadPhoto(req.user.id, req.file.filename);
			req.user.photoHash = hash;
			return res.json(jm.success(hash));
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/photo/remove:
	 *   post:
	 *     tags:
	 *       - Profile
	 *     summary: 移除登入者照片
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *     responses:
	 */
	router.post('/photo/remove', sign.apiCheck, async (req, res, next) => {
		try{
			await userService.removePhoto(req.user.id);
			delete req.user.photoHash;
			return res.json(jm.success());
		}
		catch(err){
			next(err);
		}
	});

	/**
	 * @swagger
	 * /profile/{id}:
	 *   get:
	 *     tags:
	 *       - Profile
	 *     summary: 取得使用者完整資料
	 *     consumes:
	 *       - application/json
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - name: id
	 *         description: user id
	 *         in: path
	 *         required: true
	 *         type: integer
	 *     responses:
	 */
	router.get('/:id', sign.apiCheck, async (req, res, next) => {
		try{
			let id = req.params.id * 1;
			if(_.isNaN(id)) return res.json(jm.badRequest());

			//let result = await userService.getProfile(id);
			let result = await userService.getProfileByORM(id);
			return res.json(jm.success(result));
		}
		catch(err){
			next(err);
		}
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

