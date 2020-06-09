var User = require("../../lib/User");
var Auth = require("../../lib/middlewares/authenticate");
var Activation = require('../../lib/Activation');
var emailManagement = require('../../lib/emailManagement');

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

	app.post('/v1/user/confirmAccount', function (req, res, next) {
		if(!req.body.code){
			return res.status(500).json({status: 'failure', message: "code not sent"});
		}
		console.log("Verifying...");
		Activation.findOne({activationToken: req.body.code}).then((result)=>{
			console.log({result})
			return User.update({update: { verified_email: true }, 
			query: {uid: result.uid}});
		}).then(async (result)=>{
			console.log({result});
			res.status(200).json({body: { status: "success", data: result}});
			try{
				let emailMeta = {
					"templateName": "welcomeEmail",
					"transport" : "sendgrid",
					"from" : "no-reply@pushdeploy.io", 
					"to" : result.email,
					"subject":"Welcome to Pushdeploy.io",
					"emailbody" : `${result.name}`,
				};     
				result = await emailManagement.sendEmail(emailMeta);
				if(!result){
					let retryTimes = 0;
					let tiid = setInterval(async function(){
						result = await emailManagement.sendEmail(emailMeta);
						if(result || retryTimes >= 10){
							clearInterval(tiid);
							console.log("emailManagement", {result, retryTimes});
							return;
						}
						retryTimes++;
					}, 10000);
				}
				console.log("emailManagement", {result});
			}catch(err){
				console.log("emailManagement:", err.message);
			}
		}).catch((err)=>{
			res.status(200).json({status: 'failure', message: err});
		});
		
	});

};