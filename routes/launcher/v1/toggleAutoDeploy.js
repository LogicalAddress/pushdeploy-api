var Auth = require("../../../lib/middlewares/authenticate"), 

Cred = require("../../../lib/middlewares/credentials"),
refreshToken = require("../../../lib/middlewares/bitbucketRtoken"),
getApp = require("../../../lib/middlewares/getApp.js"),
createWebHook = require("../../../lib/launcher/createGitWebHooks.js"),
updateWebHook = require("../../../lib/launcher/updateGitWebHooks.js");

module.exports = function (app) {
	app.post('/v1/app/toggle_auto_deploy', Auth, refreshToken, Cred, getApp, (req, res, next) => {
		if(req.techpool.app.webhook_sub_id){
			updateWebHook(req.techpool.app, req.techpool.credentials)
			.then((response)=>{
				req.techpool.app.webhook_sub_data = JSON.stringify(response.data);
				req.techpool.app.auto_deploy = !req.techpool.app.auto_deploy;
				req.techpool.app.save().then((app)=>{
					console.log("updating.. webhook information", app, response);
					res.status(200).json({body: { status: "success", data: app }});
					return;
				});
			}).catch((error)=>{
				console.log("Error toggling auto_deploy", error);
				res.status(400).json({body: { status: "failure", message: "Unable to toggle auto deploy"}});
				return;
			});
		}else{
			createWebHook(req.techpool.app, req.techpool.credentials)
			.then((response)=>{
				req.techpool.app.webhook_sub_id = response.webhook_id;
				req.techpool.app.webhook_sub_data = JSON.stringify(response.data);
				req.techpool.app.auto_deploy = !req.techpool.app.auto_deploy;
				req.techpool.app.save().then((app)=>{
					console.log("saving..webhook information", app, response);
					res.status(200).json({body: { status: "success", data: app }});
					return;
				});
			}).catch((error)=>{
				console.log("Error toggling auto_deploy", error);
				res.status(400).json({body: { status: "failure", message: "Unable to toggle auto deploy"}});
				return;
			});
		}
	});
};