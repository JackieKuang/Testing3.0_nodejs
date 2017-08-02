'use strict';

const crypto = require('crypto');
const winston = require('winston');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const appRoot = require('app-root-path');

const constants = require(appRoot + '/constants');
const jm = require(appRoot + '/routes/api/utils/json-msg-util');
const db = require(appRoot + '/services/db-service');

const COOKIE_MAX_AGE = 86400 * 1000;


module.exports = (app) => {
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((session_user, done) => {
		done(null, session_user);
	});

	passport.use('signIn', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'pwd',
			passReqToCallback: true,
		}, async (req, email, password, done) => {
			let saltPwd = crypto.createHash(constants.HASH_SALT.HASH_TYPE)
				.update(constants.HASH_SALT.DEFAULT_SALT + password + constants.HASH_SALT.POSTFIX_SALT)
				.digest('hex');

			let sql = "select id, email, name, photoHash from User u where u.email=:email and u.password=:password";
			let user = await db.findOne(sql, {email: email, password: saltPwd});
			if(user) return done(null, user);

			winston.warn('[Passport] User login failed:', email);
			return done(null, false/*, jm.unauthorized()*/);
		}
	));
};
