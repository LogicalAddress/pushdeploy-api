var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var UserServerSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},

	server_name: { type: String, default: 'userspace'},
	provider: { type: String, default: 'linode'},
	private_key: { type: String },
	public_key: { type: String },
	root_passwd: { type: String },
	ipv4: {type: String },
	ipv6: {type: String },
	
	apps: [{
	    type: Schema.ObjectId,
	    ref: 'user_app',
	}],

	enabled: { type: Boolean, default: true},
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserServerSchema.set('autoIndex', true);

module.exports = mongoose.model('user_server', UserServerSchema);