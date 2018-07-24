var User = require("../../lib/User");
var Auth = require("../../lib/middlewares/authenticate");

module.exports = function (app) {
	app.get('/v1/user', Auth, function (req, res, next) {
		User.findById(req.techpool.user._id).then((record)=>{
		    // var access_token = req.techpool.user.access_token;
		    // record.access_token = access_token;
			res.status(200).json({body: {status: "success", data: record}});
		}).catch((error)=>{
			console.log(error);
		    res.status(500).json({status: 'failure', message: error});
		});
	});
};