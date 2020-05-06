var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var EventsSchema = new Schema({

	uid: {
		type: String,
		index: true,
	},
	action: {type: String },
	status: {type: String },
	error: { type: String },
	file: { type: String },
    message: {type: String },
	data: { type: String },
	request: { type: String },
	response: { type: String },
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now}
});

EventsSchema.set('autoIndex', true);

module.exports = mongoose.model('event', EventsSchema);