'use strict';

const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');

const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

let webpackEntries = {
	'testing3': ['./client/src/testing3.js'],
};

let webpackPlugins;
if ('production' === process.env.NODE_ENV) {
	webpackPlugins = [
		//new webpack.optimize.UglifyJsPlugin({ compress: { warnings: true } }),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV)}})
	]
} else {
	_(webpackEntries).forEach((entry, key) => {
		entry.push(hotMiddlewareScript);
	});
	webpackPlugins = [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	];
}

module.exports = {
	entry: webpackEntries,
	assets: {
		stats: {
			chunks: false,
			colors: true
		}
	},
	output: {
		path: path.join(__dirname, 'client/public/js/'),
		filename: '[name].js',
		publicPath: '/js/'
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['babel', 'jsx?harmony'],
				include: path.join(__dirname, 'client/src'),
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{test: /\.hbs$/, loader: 'handlebars-loader'}
		]
	},
	plugins: webpackPlugins
};
