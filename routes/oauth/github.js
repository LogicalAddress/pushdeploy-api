var UserAuthCredential = require("../../lib/launcher/UserAuthCredential");
var Auth = require("../../lib/middlewares/authenticate");

module.exports = function (app) {
	app.post('/v1/oauth2/github/create', Auth, function (req, res, next) {
		UserAuthCredential.update({query: {
			uid: req.techpool.user.uid
		}, update: req.body}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};