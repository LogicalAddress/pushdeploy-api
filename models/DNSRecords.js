var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var DNSRecordSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},
	zone: { type: Schema.ObjectId, ref: 'dns', required : true, index: true},
	name: { type: String, required: true },
	
	label: {type: String },

	id: { type: String, index: true },

	'class': {type: String },

	type: { type: String },
	
    ttl: { type: Number },
    rdata: { type: String },
    	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

DNSRecordSchema.set('autoIndex', true);

module.exports = mongoose.model('dns_record', DNSRecordSchema);