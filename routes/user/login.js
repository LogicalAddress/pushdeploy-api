var User = require("../../lib/User");
var _ = require("underscore");
module.exports = function (app) {
	app.post('/v1/user/login', function (req, res, next) {
		User.auth(req.body).then((record)=>{
			let access_token = User.object2Token(record);
			let result = Object.assign({}, record, {access_token: access_token});
			res.status(200).json({body: {status: "success", data: result}});
		}).catch((error)=>{
			console.log(error);
		    res.status(500).json({status: 'failure', message: 'Sorry, We are unable to authenticate you at this time.'});
		});
	});
};