'use strict';

require('dotenv').config({silent: true});

const sys = require('./package.json').sys;

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
//const passport = require('passport');
const session = require('express-session');
//const RedisStore = require('connect-redis')(session);
//const redisUrl = require('redis-url').parse(sys.redis.endpoint);

const app = express();

app.NAME = sys.name;

// view engine setup
const hbs = handlebars.create({
	extname: '.html',
	layoutsDir: './views/layouts',
	partialsDir: ['./views/layouts']
});
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', hbs.engine);
app.set('view engine', '.html');

app.use(favicon(path.join(__dirname, 'client/public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/*app.use(session({
	store: new RedisStore({
		host: redisUrl.hostname,
		port: redisUrl.port,
		db: redisUrl.database * 1,
		ttl: 8 * 3600,
		prefix: sys.redis.prefix,
		logErrors: true,
		pass: process.env.REDIS_PASSWORD,
	}),
	secret: sys.redis.secret,
	resave: false,
	saveUninitialized: false
}));*/
/*app.use(session({
	secret: 'xxx',
	saveUninitialized: false,
	resave: false,
}));*/
app.use(session({
	secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
	cookie: { maxAge: 60 * 1000 }
}));

//app.use(passport.initialize());
//app.use(passport.session());

require('./boot/winston')(app);
require('./boot/webpack')(app);
//require('./boot/connector')(app);
//require('./boot/passport')(app);
require('./boot/swagger-spec')(app);
//require('./boot/cachedjs')(app);
require('./routes')(app);

// public static resources
app.use(express.static(path.join(__dirname, 'client/public')));

// private static resources for authenticated users
/*app.use((req, res, next) => {
	if (!req.isAuthenticated()) return res.redirect('/');
	next();
});*/

// catch 404 and forward to error handler
app.use((req, res, next) => {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'dev' ? err : {};

	// render the error page
	err.status = err.status || 500;
	res.status(err.status);
	res.render('error', {error: err});
});

module.exports = app;
