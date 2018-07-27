var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var UserDatabaseSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},
	server: { type: Schema.ObjectId, ref: 'user_server', required : true, index: true},
	db_name: { type: String, default: 'default'}, //must be unique per server - tester should take note.
	
	username: { type: String },
	
	password: { type: String },
	
	db_type: {type: String, default: 'mysql'},

	host: { type: String, default: '127.0.0.1' },
	
	state: { type: String, default: 'CREATE_IN_PROGRESS' },
	
	isPublic: {type: Boolean, default: false}, //does not listen on extenal IP
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserDatabaseSchema.set('autoIndex', true);

module.exports = mongoose.model('user_database', UserDatabaseSchema);