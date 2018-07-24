var User = require("../../lib/User");
var Auth = require("../../lib/middlewares/authenticate");
var Servers = require("../../lib/launcher/UserServers");

module.exports = function (app) {
	
	app.get('/v1/servers', Auth, function (req, res, next) {
		Servers.findAllByUid(req.techpool.user.uid).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};