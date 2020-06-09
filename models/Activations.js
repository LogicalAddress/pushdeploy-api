var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var ActivationSchema = new Schema({

	activationToken: {
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
	
	created_at: { type: Date, default: Date.now},
});

ActivationSchema.set('autoIndex', true);

module.exports = mongoose.model('activation', ActivationSchema);