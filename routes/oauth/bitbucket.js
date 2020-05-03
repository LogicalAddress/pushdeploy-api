var UserAuthCredential = require("../../lib/launcher/UserAuthCredential");
var Auth = require("../../lib/middlewares/authenticate");

module.exports = function (app) {
	app.post('/v1/oauth2/bitbucket/create', Auth, function (req, res, next) {
		console.log("Faking response!", req.body);
		return res.status(200).json({body: { status: "failure", data: req.body}});
		UserAuthCredential.update({query: {// jshint ignore:line
			uid: req.techpool.user.uid
		}, update: req.body}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});

	app.post('/webhooks/bitbucket', Auth, function (req, res, next) {
		console.log("RECV bitbucket WebHooks/Notification!", req.body);		
		return res.status(200).json({body: { status: "recv"}});	
	});
};