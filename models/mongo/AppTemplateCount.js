var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var AppTemplateCountSchema = new Schema({
	server: { type: Schema.ObjectId},
	port: { type: Number, default: 3000},
	count: {type: Number, default: 1},
	template: { type: String, default: 'nodejs'},
});

AppTemplateCountSchema.set('autoIndex', true);

module.exports = mongoose.model('app_template_count', AppTemplateCountSchema);