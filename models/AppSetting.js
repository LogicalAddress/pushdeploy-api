var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

// Keeps track of the number of apps created so far in the server
var AppSetting = new Schema({
	stripeKey: {type: String, default: null},
	paystackKey: {type: String, default: null}, // the accuracy of this value is not important to us
});

module.exports = mongoose.model('app_setting', AppSetting);