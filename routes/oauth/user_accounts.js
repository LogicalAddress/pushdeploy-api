var UserAuthCredential = require("../../lib/launcher/UserAuthCredential");
var Auth = require("../../lib/middlewares/authenticate");

module.exports = function (app) {
	app.get('/v1/user/credentials', Auth, function (req, res, next) {
		UserAuthCredential.findByUID(req.techpool.user.uid).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};