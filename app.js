// mongoose setup
require( './db' );

var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

var routes = require('./routes/index');
var api = require('./routes/api');
var users = require('./routes/users')


//**************

var app = express();
var env = process.env.NODE_ENV || 'development';
var forceSsl = function(req, res, next) {
	if (req.headers['x-forwarded-proto'] !== 'https') {
		return res.redirect(['https://', req.get('Host'), req.url].join(''));
	}
		
	return next();
}

if (env === 'production') {
	app.use(forceSsl);
}



// view engine setup
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/angular', express.static(__dirname + '/node_modules/angular/'));
app.use('/angular-route', express.static(__dirname + '/node_modules/angular-route/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/'));
app.use('/bootstrap', express.static(__dirname + '/public/bootstrap/'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/'));

var corsOptions = {
   origin: true,
   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
   methods: ['GET', 'PUT', 'POST'],
   allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept', 'X-XSRF-TOKEN'],
   credentials: true
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('jdb secret key'));
app.use(session({ secret: 'my secret key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// config Passport
var configPassport = require('./passport/config');



app.use('/', routes);
app.use('/api', api);
app.use('/users', users);



app.all('/*', function(req, res) {
        res.render('index', {title: "JDB"});
    });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
