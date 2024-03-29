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
	
	db_root_password: { type: String, default: 'secret' },

	linode_token: { type: String },
	linode_username: { type: String },
	linode_email: { type: String },
	linode_scope: { type: String },
	linode_refresh_token: { type: String },
	linode_token_expiry: { type: String },
	linode_token_expiry_date: { type: Date },
	linode_token_type: { type: String },
	linode_raw: { type: String },
	
	digitalocean_token: { type: String },
	digitalocean_username: { type: String },
	digitalocean_email: { type: String },
	digitalocean_scope: { type: String },
	digitalocean_refresh_token: { type: String },
	digitalocean_token_expiry: { type: String },
	digitalocean_token_expiry_date: { type: String },
	digitalocean_token_type: { type: String },
	digitalocean_raw: { type: String },
	
	
	bitbucket_username: { type: String },
	bitbucket_profile: { type: String },
	bitbucket_token: { type: String },
	bitbucket_refresh_token: { type: String },
	bitbucket_token_expiry: { type: String },
	bitbucket_scope: { type: String },
	bitbucket_token_type: { type: String },
	
	github_username: { type: String },
	github_profile: { type: String },
	github_token: { type: String },
	github_refresh_token: { type: String },
	github_token_expiry: { type: String },
	github_scope: { type: String },
	github_token_type: { type: String },
	github_raw: { type: String },
	
	aws_secret_key: { type: String }, //for caching purpose - last used secret key
	aws_access_key: { type: String }, //for caching purpose - last used access key
	aws_KeyFingerprint: { type: String },
	aws_KeyMaterial: { type: String },
	aws_KeyName: { type: String },
	aws_SecurityGroupId: { type: String },
	
	custom_private_key: { type: String },
	custom_public_key: { type: String },
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserAuthCredentialSchema.set('autoIndex', true);

module.exports = mongoose.model('user_auth_crendential', UserAuthCredentialSchema);