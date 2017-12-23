var UserAuthCredential = require("../../lib/launcher/UserAuthCredential");
var Auth = require("../../lib/middlewares/authenticate");

module.exports = function (app) {
	app.post('/v1/oauth2/bitbucket/create', Auth, function (req, res, next) {
		UserAuthCredential.update({query: {
			uid: req.techpool.user.uid
		}, update: {
			bitbucket_refresh_token: req.body.bitbucket_refresh_token,
			bitbucket_token: req.body.bitbucket_refresh_token,
			bitbucket_token_expiry: req.body.bitbucket_token_expiry
		}}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};