'use strict';

const _ = require('lodash');
const winston = require('winston');
const appRoot = require('app-root-path');
const moment = require('moment');
const crypto = require('crypto');
const constants = require(appRoot + '/constants');
const db = require('../../../services/db-service');
const mailSender = require('../utils/mail-sender-util');
const fs = require('fs');

const models = require('../../../models');


let _sendSignUpMail = (email, name, token) => {
	let text = fs.readFileSync(appRoot + '/views/template/mail-signup.html', 'utf8').toString();
	text = text.replace('{user}', name).replace('{url}', 'http://127.0.0.1:3001/activate/' + token);
	mailSender.send(email, '[NBase2]帳號開通驗證', text);
}

let service = {};
service.getUserCount = async () => {
	let sql = 'select count(id) as count from User';
	let result = await db.findOne(sql);
	return result;
}

service.signup = async (user) => {
	let sql = 'select email, name, token, validAt from User where email=:email';
	let result = await db.findOne(sql, user);
	if(!_.isNil(result)){
		if(_.isNil(result.validAt)) _sendSignUpMail(result.email, result.name, result.token);
		return result;
	}

	sql = 'insert into User(email, password, name, gender, birthday, token) ' +
		'values(:email, :pwd, :name, :gender, :birthday, :token)';
	user.pwd = crypto.createHash(constants.HASH_SALT.HASH_TYPE)
		.update(constants.HASH_SALT.DEFAULT_SALT + user.pwd + constants.HASH_SALT.POSTFIX_SALT)
		.digest('hex');
	user.token = Math.random().toString(36).slice(3);
	await db.insert(sql, user),	// return 'PK' of inserted data...,
	result = {
		email: user.email,
		'new': true
	}
	_sendSignUpMail(user.email, user.name, user.token);

	return result;
};

service.logSignin = async (id, userAgent) => {
	let logs = await db.find('select * from User_Log where userId=? and signoutAt is null', [id]);
	if(logs && logs.length > 0)
		await db.update('update User_Log set signinAt=?, device=? where id=?', [new Date(), userAgent, logs[0].id]);
	else await db.insert('insert into User_Log(userId, device) values(?, ?)', [id, userAgent]);
	return true;
};

service.logSignout = async (id) => {
	let logs = await db.find('select * from User_Log where userId=? and signoutAt is null', [id]);
	if(logs && logs.length > 0)
		await db.update('update User_Log set signoutAt=?  where id=?', [new Date(), logs[0].id]);
	return true;
};

service.activate = async (token) => {
	let sql = 'select * from User where token=?';
	let user = await db.findOne(sql, [token]);
	if(_.isNil(user)) return false;

	let result = {
		email: user.email,
		validated: !_.isNil(user.validAt)
	};
	if(!result.validated){
		await db.update('update User set validAt=:now where id=:id', {
			id: user.id,
			now: new Date()
		})
	}
	return result;
}

service.count = async () => {
	return await db.findOne('select count(id) as count from User');
}

service.find = async (criteria) => {
	let sql = 'select * from User where 1=1';
	if(criteria.kw){
		sql += ' and (email like :email or name like :name)';
		let kw = '%' + criteria.kw + '%';
		criteria.email = criteria.name = kw;
		delete criteria.kw;
	}
	if(criteria.date1){
		sql += ' and createdAt >= :date1';
		criteria.date1 += ' 00:00:00';
	}
	if(criteria.date2) {
		sql += ' and createdAt <= :date2';
		criteria.date2 += ' 23:59:59';
	}
	if(criteria.valid == 1) sql += ' and validAt is not null';
	else if(criteria.valid == 0) sql += ' and validAt is null';
	let result = await db.find(sql, criteria).map(user => {
		user.age = moment(new Date()).diff(moment(user.birthday), 'years');
		return user;
	});
	return result;
}

service.uploadPhoto = async (userId, fileName) => {
	try {
		let oldHash = await db.findOne('select photoHash from User where id=?', [userId]);
		if (oldHash) fs.unlinkSync(constants.FILE_PATH.PROFILE_PHOTO + '/' + oldHash.photoHash);
	}
	catch(err){
		winston.log('delete file error: ' + err);
	}
	let photoHash = (((Math.random() + '').slice(2) + userId) * 1).toString(36);
	await db.update('update User set photoHash=? where id=?', [photoHash, userId]);
	let oldPath = constants.FILE_PATH.PROFILE_PHOTO + '/' + fileName;
	fs.renameSync(oldPath, constants.FILE_PATH.PROFILE_PHOTO + '/' + photoHash);
	return photoHash;
}

service.removePhoto = async (userId) => {
	try {
		let oldHash = await db.findOne('select photoHash from User where id=?', [userId]);
		if (oldHash) fs.unlinkSync(constants.FILE_PATH.PROFILE_PHOTO + '/' + oldHash.photoHash);
	}
	catch(err){
		winston.log('delete file error: ' + err);
	}
	await db.update('update User set photoHash=? where id=?', [null, userId]);
	return true;
}

service.getProfile = async (id) => {
	let sql = 'select * from User where id=:id';
	let result = await db.findOne(sql, {id: id});
	delete result.password;
	delete result.token;
	result.projects = await db.find('select * from Project where userId=? order by startDate desc', [id]);
	return result;
}
service.getProfileByORM = async (id) => {
	if(!models.User.hasAlias('projects'))
		models.User.hasMany(models.Project, {foreignKey: 'userId', as: 'projects'});
	let result = await models.User.findOne({
		where: {id: id},
		include: ['projects'],
		//raw: true
	});
	result = result.dataValues;
	delete result.password;
	delete result.token;
	return result;
}

service.getProfileBasic = async (id) => {
	let sql = 'select * from User where id=:id';
	let result = await db.findOne(sql, {id: id});
	delete result.password;
	delete result.token;
	return result;
}
service.getProfileBasicByORM = async (id) => {
	let user = models.User.findOne({
		where: {id: id},
		raw: true
	});
	delete user.password;
	delete user.token;
	return user;
}

service.updateProfileBasic = async (id, user) => {
	let sql = 'update User set ';
	if(user.name) sql += 'name=:name, ';
	if(!_.isNil(user.gender)) sql += 'gender=:gender, ';
	if(!_.isNil(user.birthday)) sql += 'birthday=:birthday, ';
	if(!_.isNil(user.blood)) sql += 'blood=:blood, ';
	if(user.height) sql += 'height=:height, ';
	if(user.weight) sql += 'weight=:weight, ';
	if(user.hobby) sql += 'hobby=:hobby, ';
	if(!_.isNil(user.slogan)) sql += 'slogan=:slogan, ';
	sql += 'id=:id ';
	sql += 'where id=:id';
	user.id = id;
	await db.update(sql, user);
	return await service.getProfileBasic(user.id);
}
service.updateProfileBasicByORM = async (id, user) => {
	delete user.email;
	delete user.password;
	delete user.token;
	delete user.createdAt;
	delete user.modifiedAt;
	delete user.validAt;
	delete user.photoHash;
	await models.User.update(user, {where: {id: id}});		// return [1]
	return await service.getProfileBasicByORM(id);
}

service.findProjects = async (userId) => {
	return await db.find('select * from Project where userId=? order by startDate desc', [userId]);
}
service.findProjectsByORM = async (userId) => {
	return await models.Project.findAll({
		where: {userId: userId},
		order: [['startDate', 'DESC']],
		raw: true
	});
}

service.getProject = async (projectId) => {
	return await db.findOne('select * from Project where id=?', [projectId]);
}

service.createProject = async (project) => {
	if(!project.endDate) project.endDate = null;
	let sql = 'insert into Project(userId, name, url, startDate, endDate, description)' +
		'values(:userId, :name, :url, :startDate, :endDate, :description)';
	project.id = await db.insert(sql, project);
	return project;
}
service.createProjectByORM = async (project) => {
	let p = await models.Project.create(project);		// return Sequelize object
	project.id = p.id;
	return project;
}

service.updateProject = async (project) => {
	let sql = 'update Project set ' +
		'name=:name, url=:url, startDate=:startDate, endDate=:endDate, description=:description ' +
		'where id=:id';
	if(_.isEmpty(project.endDate)) project.endDate = null;
	await db.update(sql, project);	// nothing return
	return project;
}
service.updateProjectByORM = async (project) => {
	if(_.isEmpty(project.endDate)) project.endDate = null;
	await models.Project.update(project, {where: {id: project.id}});	// return [1]
	return project;
}

service.deleteProject = async (projectId) => {
	await db.delete('delete from Project where id=?', [projectId]);  // nothing return;
	return true;
}
service.deleteProjectByORM = async (projectId) => {
	let count = await models.Project.destroy({where: {id: projectId}});		// return 1 (effect rows)
	return count > 0;
}

service.getLogCount = async (userId) => {
	return (await db.findOne('select count(id) as count from User_Log where userId=?', [userId])).count;
}

service.getLogs = async (userId, cursor) => {
	return await db.find('select * from User_Log where userId=? order by signinAt desc limit ?, 50', [userId, cursor]);
}


module.exports = service;
