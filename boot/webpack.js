'use strict';
const webpack = require('webpack');
const winston = require('winston');

module.exports = (app) => {
	if('production' != process.env.NODE_ENV) {
		let config = require('../webpack.config');
		let compiler = webpack(config);

		app.use(require("webpack-dev-middleware")(compiler, {
			noInfo: false,
			stats: {
				chunks: false,
				colors: true
			},
			publicPath: config.output.publicPath
		}));
		app.use(require("webpack-hot-middleware")(compiler));

		winston.info('[' + app.NAME + '] --> Webpack hot reloading ENABLED');
	}
};
