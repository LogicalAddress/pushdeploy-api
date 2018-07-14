var UserAuthCredential = require("../../lib/launcher/UserAuthCredential");
var Auth = require("../../lib/middlewares/authenticate");

module.exports = function (app) {
	app.post('/v1/oauth2/github/create', Auth, function (req, res, next) {
		var load = req.body;
		console.log('load', load);
		load.github_profile = JSON.stringify(req.body.github_profile);
		UserAuthCredential.update({query: {
			uid: req.techpool.user.uid
		}, update: load}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};