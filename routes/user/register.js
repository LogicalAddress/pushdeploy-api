var User = require("../../lib/User");
module.exports = function (app) {
	app.post('/v1/user/register', function (req, res, next) {
		User.register(req.body).then((record)=>{
			res.status(201).json({status: "success", data: record});
		}).catch((error)=>{
		    res.state(500).json({status: 'failure', message: error})
		});			
	});
};