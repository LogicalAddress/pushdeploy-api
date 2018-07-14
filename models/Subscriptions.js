var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var SubscriptionSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},
	
	provider: {type: String, default: 'stripe'},
	
	name: {type: String, default: ''},
	description: {type: String, default: ''},
	email: {type: String, default: ''},
	mobileNumber: {type: String, default: ''},
	amount: {type: Number, default: ''},
	plan: {type: String, default: ''},
	currency: {type: String, default: 'USD'},
	raw: String,
	
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

SubscriptionSchema.set('autoIndex', true);

module.exports = mongoose.model('subscription', SubscriptionSchema);