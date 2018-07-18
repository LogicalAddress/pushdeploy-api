var Auth = require("../../lib/middlewares/authenticate"), 
UserApps = require('../../lib/launcher/UserApps'), 
Cred = require("../../lib/middlewares/credentials"),
appLogs = require("../../lib/launcher/appLogs");

module.exports = function (app) {
	
	app.get('/v1/app/logs_', Auth, Cred, (req, res, next) => {

		UserApps.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.app_id,
		}).then((response)=>{
			var _app = response;
			if(response){
				res.status(200).json({body: { status: "IN_PROGRESS", data: _app }});
				appLogs(req, _app.server, _app);
			}else{
				res.status(400).json({body: { status: "failure", message: "App does not exists" }});
				return;
			}
		}).catch((error)=>{
			console.log("GET APP ERR", error);
			return;
		});
		
	});
};