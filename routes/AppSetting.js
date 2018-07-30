var AppConfig = require('../config/app.js');

module.exports = function (app) {
	app.get('/client_setting', function (req, res, next) {
		res.status(200).json({ body: {status: 'success', data: AppConfig.ClientSetting}});
	});
};