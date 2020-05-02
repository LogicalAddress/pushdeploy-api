var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var AppDeployLogSchema = new Schema({

	uid: {
		type: String,
		index: true,
		required : true
	},
	server: { type: Schema.ObjectId, ref: 'user_server', required : true, index: true},
	app: { type: Schema.ObjectId, ref: 'user_app', required : true, index: true},
	app_name: { type: String},
	deploy_type: { type: String, default: 'manual'}, //auto deploy
	status: { type: String, default: 'failed'}, //success
	message: { type: String },
	created_at: { type: Date, default: Date.now},
	updated_at: { type: Date, default: Date.now},
});

AppDeployLogSchema.set('autoIndex', true);

module.exports = mongoose.model('app_deploy_log', AppDeployLogSchema);