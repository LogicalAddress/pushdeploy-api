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
	superuser: {type: String },
	ipv4: {type: String },
	ipv6: {type: String },
	instanceId: {type: String },
	meta: { type: String },
	
	aws_account_id: { type: String },
	aws_reservation_id: { type: String },
	aws_accessKeyId: { type: String },
	aws_secretAccessKey: { type: String },
	aws_SecurityGroupId: { type: String },
	aws_KeyName: { type: String },
	aws_KeyFingerprint: { type: String },
	aws_KeyMaterial: { type: String },
	aws_region: { type: String },
	
	
	apps: [{
	    type: Schema.ObjectId,
	    ref: 'user_app',
	}],
	
	cargoshell_version: { type: String, default: '0.1'},

	enabled: { type: Boolean, default: true},
	
	state: { type: String, default: 'CREATE_IN_PROGRESS' },
	
	_app_counter: { type: Number, default: 0 },
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserServerSchema.set('autoIndex', true);

module.exports = mongoose.model('user_server', UserServerSchema);