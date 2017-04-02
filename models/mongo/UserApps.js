var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var UserAppSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},
	server: { type: Schema.ObjectId, ref: 'user_server', required : true, index: true},
	// for managing nodejs's template variation see: https://pypi.python.org/pypi/nodeenv/
	app_name: { type: String, default: 'default'},
	port: { type: String, default: '3000'}, //as more nodejs apps are addded, we port++
	template: { type: String, default: 'nodejs'}, //{python2, python3}, {php5.6, php7.0}
	template_variation: { type: String, default: 'v4'}, //{django}, {laravel, wordpress,}

	enabled: { type: Boolean, default: true},
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserAppSchema.set('autoIndex', true);

module.exports.UserAppModel = mongoose.model('user_app', UserAppSchema);