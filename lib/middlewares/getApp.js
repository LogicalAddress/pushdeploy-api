var App = require('../launcher/UserApps');
module.exports = function (req, res, next)
{
	App.findOne({
		uid: req.techpool.user.uid, 
		_id: req.body.app_id || req.body._id,
	}).then((response)=>{
		var _app = response;
		if(response){
			req.techpool = req.techpool || {};
			req.techpool.app = _app;
			next();
			return;
		}else{
			console.log("App not Found via the getApp.js Middleware");
			res.status(400).json({body: { status: "failure", message: "App Not Found" }});
			return;
		}
	}).catch((error)=>{
		console.log("GET APP ERR", error);
		res.status(400).json({body: { status: "failure", message: "App Not Found" }});
		return;
	});

};