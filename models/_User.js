module.exports = function (sequelize, DataTypes) {
	return sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		gender: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: 1
		},
		birthday: {
			type: DataTypes.DATE,
			allowNull: false
		},
		blood: {
			type: DataTypes.STRING,
			allowNull: true
		},
		height: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0
		},
		weight: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0
		},
		hobby: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0
		},
		slogan: {
			type: DataTypes.STRING,
			allowNull: true
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: ""
		},
		createdAt: {
			type: DataTypes.TIME,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		modifiedAt: {
			type: DataTypes.TIME,
			allowNull: true
		},
		validAt: {
			type: DataTypes.TIME,
			allowNull: true
		},
		photoHash: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		timestamps: false,
		paranoid: false,
		freezeTableName: true,
		tableName: 'User'
	});
};
