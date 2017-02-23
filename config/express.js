var glob = require('glob');
var logger = require('morgan');
var bodyParser = require('body-parser');
var compress = require('compression');

module.exports = function(app, config) {
    var env = process.env.NODE_ENV || 'development';
	app.locals.ENV = env;
	app.locals.ENV_DEVELOPMENT = env == 'development';
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(compress());
	
	var middlewares = glob.sync(config.AppRoot + '/middlewares/*.js');
	middlewares.forEach(function (middleware) {
		require(middleware)(app);
	});
	
	var listeners = glob.sync(config.AppRoot + '/listeners/*.js');
	listeners.forEach(function (listener) {
		require(listener)(app);
	});
	
	var controllers = glob.sync(config.AppRoot + '/routes/*/*.js');
	controllers.forEach(function (controller) { 
		require(controller)(app);
	});
};