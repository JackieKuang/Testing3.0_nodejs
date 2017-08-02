'use strict';

const fs = require('fs');
const path = require('path');
const sequelize = require('../services/db-service').sequelize;
const models = {};
const basename = path.basename(module.filename);

fs.readdirSync(__dirname)
	.filter((file) => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach((file) => {
		let model = sequelize['import'](path.join(__dirname, file));
		models[model.name] = model;
	});

/*Object.keys(models).forEach((model_name) => {
	if (models[model_name].associate) {
		models[model_name].associate(models);
	}
});*/

module.exports = models;
