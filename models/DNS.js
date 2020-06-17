var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var DNSSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},
	app: { type: Schema.ObjectId, ref: 'user_app', index: true},
	name: { type: String, required: true },
	
	provider: {type: String, default: 'Route53'},

	nameservers: { type: String, default: ''},

	id: { type: String, index: true },

	owner: {type: String, default: 'pushdeploy'},
	
    state: { type: String },
    	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

DNSSchema.set('autoIndex', true);

module.exports = mongoose.model('dns', DNSSchema);