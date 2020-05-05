var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var PaymentsSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},
    name: {type: String, default: ''},
    payment_type: { type: String, default: 'stripe'},
	description: {type: String, default: ''},
	email: {type: String, default: ''},
	amount: {type: Number, default: ''},
	customerId: {type: String, index: true},
    status: {type: String, default: 'pending'},
    currency: {type: String, default: 'USD'},
    chargeReference: {type: String, index: true},
    chargeSuccess: {type: String },
    chargeFailure: {type: String },
    chargePending: {type: String },
    receipt_url: { type: String },
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

PaymentsSchema.set('autoIndex', true);

module.exports = mongoose.model('payment', PaymentsSchema);