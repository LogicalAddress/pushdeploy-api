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
	app_name: { type: String, default: 'default'}, //must be unique per server - tester should take note.
	port: { type: Number, default: 3000}, //as more nodejs apps are addded, we port++, unique too per server
	template: { type: String, default: 'nodejs'}, //{python2, python3}, {php5.6, php7.0}
	template_variation: { type: String, default: 'v4'}, //{django}, {laravel, wordpress,}
	app_repository: {type: String, default: ''}, 
	
	app_shell_script: {type: String, default: ''},

	enabled: { type: Boolean, default: true},
	
	auto_deploy: {type: Boolean, default: false},
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserAppSchema.set('autoIndex', true);

module.exports = mongoose.model('user_app', UserAppSchema);