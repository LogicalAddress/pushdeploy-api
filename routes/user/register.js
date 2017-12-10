var User = require("../../lib/User");
module.exports = function (app) {
	app.post('/v1/user/register', function (req, res, next) {
		console.log(req.body);
		User.create(req.body).then((record)=>{
			var access_token = User.object2Token(record);
		    record.access_token = access_token;
			res.status(200).json({status: "success", data: record});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};