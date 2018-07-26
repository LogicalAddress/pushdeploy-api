var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var UserSchema = new Schema({

	uid: {
		type: String,
		index: true,
		unique: true,
		required : true
	},
	userType: { type: String, default: 'customer'},
	mobileNumber: {type: String, index: true, unique: true, required: true }, 
	email: {type: String, index: true, unique: true, required: true }, 
	password: {type: String, required: true},
	name: {type: String, required: true},
	enabled: { type: Boolean, default: true},
	currency: { type: String, default: 'USD' },
	
	primaryPlan: { type: String, default: '' },
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

UserSchema.set('autoIndex', true);

module.exports = mongoose.model('user', UserSchema);