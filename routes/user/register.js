var User = require("../../lib/User");
var Recaptcha = require('recaptcha-verify');
var hat = require('hat');
var emailManagement = require('../../lib/emailManagement');
var AppConfig = require('../../config/app');
var Activation = require('../../lib/Activation');

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
					req.body.token = hat();
					User.create(req.body).then(async (record)=>{
						var access_token = User.object2Token(record);
						record.access_token = access_token;
						res.status(200).json({body: {status: "success", data: record}});
						try{
							let activate = await Activation.create({
								uid: record.uid,
								email: record.email,
								activation_token: req.body.token,
							});
							let emailMeta = {
								"templateName": "verificationEmail",
								"transport" : "sendgrid",
								"from" : "no-reply@pushdeploy.io", 
								"to" : record.email,
								"subject":"Pushdeploy Email Verification",
								"emailbody" : `${AppConfig.dashboardURL}/confirmAccount/${req.body.token}`,
								"firstname" : record.name
							};     
							let result = await emailManagement.sendEmail(emailMeta);
							if(!result){
								let retryTimes = 0;
								let tiid = setInterval(async function(){
									result = await emailManagement.sendEmail(emailMeta);
									if(result || retryTimes >= 10){
										clearInterval(tiid);
										console.log("emailManagement:", {result, retryTimes});
										return;
									}
									retryTimes++;
								}, 10000);
							}
							console.log("emailManagement:", {result});
						}catch(err){
							console.log("emailManagement:", err.message);
						}
					}).catch((error)=>{
						res.status(500).json({status: 'failure', message: "Unable to register"});
					});
				}else{
					res.status(400).json({status: 'failure', message: "Sorry, Unable to tell if you are human or robot"});
				}
			});
		}else{
			req.body.token = hat();
			User.create(req.body).then(async(record)=>{
				var access_token = User.object2Token(record);
				record.access_token = access_token;
				console.log({body: {status: "success", data: record}});
				res.status(200).json({body: {status: "success", data: record}});
				try{
					let activate = await Activation.create({
						uid: record.uid,
						email: record.email,
						activation_token: req.body.token,
					});
					let emailMeta = {
						"templateName": "verificationEmail",
						"transport" : "sendgrid",
						"from" : "no-reply@pushdeploy.io", 
						"to" : record.email,
						"subject":"Pushdeploy Email Verification",
						"emailbody" : `${AppConfig.dashboardURL}/confirmAccount/${req.body.token}`,
						"firstname" : record.name
					};     
					let result = await emailManagement.sendEmail(emailMeta);
					if(!result){
						let retryTimes = 0;
						let tiid = setInterval(async function(){
							result = await emailManagement.sendEmail(emailMeta);
							if(result || retryTimes >= 10){
								clearInterval(tiid);
								console.log("emailManagement:", {result, retryTimes});
								return;
							}
							retryTimes++;
						}, 10000);
					}
					console.log("emailManagement:", {result});
				}catch(err){
					console.log("emailManagement:", err.message);
				}
			}).catch((error)=>{
				console.log({error});
				res.status(500).json({status: 'failure', message: "Unable to register"});
			});
		}
		
	});
};