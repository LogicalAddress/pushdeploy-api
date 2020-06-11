var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var ActivationSchema = new Schema({

	activation_token: {
		type: String,
		index: true,
		unique: true,
		required : true
    },
    
    uid: {
		type: String,
		index: true,
		required : true
	},

	type: { type: String, default: 'registration'},

	expireAt: {
		type: Date,
		default: Date.now,
		index: { expires: '1d' },
	},

	email: {
		type: String,
        index: true
	},

	password:{
        type: String
    },
	
	created_at: { type: Date, default: Date.now},
});

ActivationSchema.set('autoIndex', true);

module.exports = mongoose.model('activation', ActivationSchema);