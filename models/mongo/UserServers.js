var mongoose = require('mongoose');
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

	enabled: { type: Boolean, default: true},
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserServerSchema.set('autoIndex', true);

module.exports.UserServerModel = mongoose.model('user_server', UserServerSchema);