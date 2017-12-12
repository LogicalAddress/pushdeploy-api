var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var UserAuthCredentialSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true,
		unique: true, //1-1 Relationship
	},

	linode_token: { type: String },
	digitalocean_token: { type: String },
	bitbucket_token: { type: String },
	github_token: { type: String },
	aws_secret_key: { type: String }, //for caching purpose - last used secret key
	aws_access_key: { type: String }, //for caching purpose - last used access key
	aws_KeyFingerprint: { type: String },
	aws_KeyMaterial: { type: String },
	aws_key_name: { type: String },
	aws_SecurityGroupId: { type: String },
	custom_private_key: { type: String },
	custom_public_key: { type: String },
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserAuthCredentialSchema.set('autoIndex', true);

module.exports = mongoose.model('user_auth_crendential', UserAuthCredentialSchema);