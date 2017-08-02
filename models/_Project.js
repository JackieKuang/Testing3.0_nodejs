module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Project', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false
		},
		startDate: {
			type: DataTypes.DATE,
			allowNull: false
		},
		endDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultVale: null
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
		},
	}, {
		timestamps: false,
		paranoid: false,
		freezeTableName: true,
		tableName: 'Project'
	});
};
