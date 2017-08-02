'use strict';

const winston = require('winston');
const Sequelize = require('sequelize');

const sys = require('../package.json').sys;
const event = require('./event-emitter');

sys.db.logging = process.env.NODE_ENV == 'dev' ? (str) => {console.info('[SQL] ' + str)} : false;
const sequelize = new Sequelize(process.env.DATABASE_NAME || 'NBase2', process.env.DATABASE_USERNAME || 'nbase2', process.env.DATABASE_PASSWORD || 'nbase2-104', sys.db);
sequelize.authenticate().then(() => {
	winston.info('[' + sys.name + '] --> Database connection successful');
	event.dbEvent.emit('database_ready');
}).catch(err => {
	winston.error('[' + sys.name + '] --> Cannot connect to database:', err);
	process.exit(1);
}).done();

const database = {
	sequelize: sequelize,

	find: (sql, params, t) => {
		let options = {type: Sequelize.QueryTypes.SELECT, replacements: params, multipleStatements: true, raw: true};
		if (t) options.transaction = t;
		return sequelize.query(sql, options);
	},

	findOne: async (sql, params, t) => {
		let result = await database.find(sql, params, t);
		return result && result.length > 0 ? result[0] : null;
	},

	insert: (sql, params, t) => {
		let options = {type: Sequelize.QueryTypes.INSERT, replacements: params};
		if (t) options.transaction = t;
		return sequelize.query(sql, options);
	},

	update: (sql, params, t) => {
		let options = {type: Sequelize.QueryTypes.UPDATE, replacements: params, multipleStatements: true};
		if (t) options.transaction = t;
		return sequelize.query(sql, options);
	},

	'delete': (sql, params, t) => {
		let options = {type: Sequelize.QueryTypes.DELETE, replacements: params};
		if (t) options.transaction = t;
		return sequelize.query(sql, options);
	},

	tx: f => {
		return sequelize.transaction({
			//isolationLevel:Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
			//autoCommit:false
		}, f);
	}
};

module.exports = database;
