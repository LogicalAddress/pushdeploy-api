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
	stripeCustomerId: {
		type: String,
		index: true,
	},
	last_subscriptionId: {
		type: String,
		index: true,
	},
	userType: { type: String, default: 'customer'},
	mobileNumber: {type: String }, 
	email: {type: String, index: true, unique: true, required: true }, 
	password: {type: String, required: true},
	name: {type: String, required: true},
	enabled: { type: Boolean, default: true},
	currency: { type: String, default: 'USD' },
	noSubscription: { type: Boolean, default: true },
	primaryPlan: { type: String, default: '' },
	verified_email: { type: Boolean, default: false },
	tryFree: { type: Boolean, default: false },
	chargeFailed: { type: Boolean, default: false }, //must always be set to set to false when payment succeed. Payments that previously succeeded and failed here after. User must be warned on the UI to try and fix.
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now},
});

UserSchema.set('autoIndex', true);

module.exports = mongoose.model('user', UserSchema);