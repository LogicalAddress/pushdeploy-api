var User = require("../../lib/User");
var Auth = require("../../lib/middlewares/authenticate");
// var Servers = require("../../launcher/UserServers");
module.exports = function (app) {
	app.post('/v1/launcher/apps', Auth, function (req, res, next) {
		console.log(req.body);
	});
};