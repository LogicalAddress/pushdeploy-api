var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

// Keeps track of the number of apps created so far in the server
var AppCounter = new Schema({
	server: { type: Schema.ObjectId, required: true, unique: true},
	count: {type: Number, default: 0}, // the accuracy of this value is not important to us
});

module.exports = mongoose.model('app_counter', AppCounter);