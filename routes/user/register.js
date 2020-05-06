var User = require("../../lib/User");
var Recaptcha = require('recaptcha-verify');
module.exports = function (app) {
	app.post('/v1/user/register', function (req, res, next) {

		if(process.env.RECAPTCHA_SECRET){
			var recaptcha = new Recaptcha({
				secret: process.env.RECAPTCHA_SECRET,
				verbose: false
			});
			recaptcha.checkResponse(req.body.recaptcha, function(error, response){
				if(error){
					res.status(500).json({status: 'failure', message: "Unable to register"});
				}
				if(response.success){
					User.create(req.body).then((record)=>{
						var access_token = User.object2Token(record);
						record.access_token = access_token;
						res.status(200).json({body: {status: "success", data: record}});
					}).catch((error)=>{
						res.status(500).json({status: 'failure', message: "Unable to register"});
					});
				}else{
					res.status(400).json({status: 'failure', message: "Sorry, Unable to tell if you are human or robot"});
				}
			});
		}else{
			User.create(req.body).then((record)=>{
				var access_token = User.object2Token(record);
				record.access_token = access_token;
				res.status(200).json({body: {status: "success", data: record}});
			}).catch((error)=>{
				res.status(500).json({status: 'failure', message: "Unable to register"});
			});
		}
		
		
		
	});
};