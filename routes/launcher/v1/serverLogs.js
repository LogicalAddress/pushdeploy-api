var Auth = require("../../../lib/middlewares/authenticate"), 
Cred = require("../../../lib/middlewares/credentials"),
UserServer = require("../../../lib/launcher/UserServers"),
serverLogs = require("../../../lib/launcher/v1/serverLogs");

module.exports = function (app, socketIO) {
	
	app.get('/v1/servers/logs_', Auth, Cred, (req, res, next) => {
		UserServer.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.server_id, 
		}).then((response)=>{
			var _server = response;
			if(response){
				res.status(200).json({body: { status: "IN_PROGRESS", data: _server }});
				serverLogs(req, _server);
				return;
			}else{
				res.status(400).json({body: { status: "failure", message: "Server does not exists" }});
				return;
			}
		}).catch((error)=>{
			console.log("FATAL ERROR", error);
		    return res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		});	
		
	});
};