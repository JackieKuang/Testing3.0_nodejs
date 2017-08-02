'use strict';

const _ = require('lodash');
const winston = require('winston');
const nodemailer = require('nodemailer');
const appRoot = require('app-root-path');
const path = require('path');
const sys = require(appRoot + '/package.json').sys;
const mailConfig = {
	auth: {
		user: sys.smtp.auth.user,
		pass: sys.smtp.auth.password
	}
};
if(sys.smtp.useGmail) {
	mailConfig.service = 'Gmail';
}
else {
	mailConfig.host = sys.smtp.host;
	mailConfig.port = sys.smtp.port;
	mailConfig.secureConnecton = false;
	delete mailConfig.auth;
}
const mailTransport = nodemailer.createTransport(mailConfig);

let sender = {};
sender.sendBy = (from, to, cc, bcc, subject, content, attachments, callback) => {
	let bcc1 = sys.mailNotification.defautSender;
	if (!_.isNil(bcc) && !_.isEmpty(bcc)) bcc1 += ';' + bcc;

	let mailInfo = {
		from: (!_.isNil(from) && !_.isEmpty(from)) ? from : sys.smtp.from,
		to: to,
		cc: cc,
		bcc: bcc1,
		subject: subject,
		html: content
	};
	if (!_.isNil(attachments) && !_.isEmpty(attachments)) {
		mailInfo.attachments = attachments.map((a) => {
			return {
				filename: a.fileName,
				path: a.path
			};
		});
	}
	setTimeout(() => {
		mailTransport.sendMail(mailInfo, (err) => {
			if(err) winston.error('[Mail] Unable to send mail to %s', to, err);
			if(process.env.NODE_ENV === 'dev') winston.info('[Mail] success send mail to: ' + to);
			return callback();
		});
	}, 1000);
}

sender.send = (to, subject, content, attachments, callback) => {
	sender.sendBy(null, to, null, null, subject, content, attachments, callback);
}


module.exports = sender;
