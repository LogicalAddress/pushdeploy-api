var User = require("../../lib/User");
var Auth = require("../../lib/middlewares/authenticate");
var Activation = require('../../lib/Activation');
var emailManagement = require('../../lib/emailManagement');
var _ = require('underscore');
var crypto = require('crypto');
var AppConfig = require('../../config/app');
var hash = require("sha256");
var hat = require('hat');
var _ = require('underscore');

module.exports = function (app) {
	app.get('/v1/user', Auth, function (req, res, next) {
		User.findById(req.techpool.user._id).then((record)=>{
			record = _.omit(record, ['password']);
			res.status(200).json({body: {status: "success", data: record}});
		}).catch((error)=>{
			console.log(error);
		    res.status(500).json({status: 'failure', message: error});
		});
	});

	app.post('/v1/user/resend-confirmLink', Auth, async function(req, res, next){
		try{
			let activation_token = hat();
			await Activation.create({
				uid: req.techpool.user.uid,
				email: req.techpool.user.email,
				activation_token,
			});
			let emailMeta = {
				"templateName": "verificationEmail",
				"transport" : "sendgrid",
				"from" : "no-reply@pushdeploy.io", 
				"to" : req.techpool.user.email,
				"subject":"Pushdeploy Email Verification",
				"emailbody" : `${AppConfig.dashboardURL}/confirmAccount/${activation_token}`,
				"firstname" : req.techpool.user.name
			};     
			let result = await emailManagement.sendEmail(emailMeta);
			return res.status(200).json({body: { status: "success", data: result}});
		}catch(err){
			console.log("emailManagement:", err.message);
			return res.status(500).json({status: 'failure', message: "Verification link not sent, please try again later"});
		}
	});

	app.post('/v1/user/confirmAccount', function (req, res, next) {
		if(!req.body.code){
			return res.status(500).json({body: {status: 'failure', message: "code not sent"}});
		}
		console.log("Verifying...");
		Activation.findOne({activation_token: req.body.code}).then((result)=>{
			return User.update({update: { verified_email: true }, 
			query: {uid: result.uid}});
		}).then(async (result)=>{
			res.status(200).json({body: { status: "success"}});
			try{
				await deletePasswordRecovery({type: 'registration', uid: result.uid});
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
			console.log({err});
			return res.status(500).json({body: {status: 'failure', message: "Error"}});
		});
		
	});

	app.post("/v1/user/passwordRecovery", function(req, res){
		let uRL = req.body.token;
		let parametersUrl = uRL.split("|");
		return Activation.findOne({"activation_token": parametersUrl[0] , "_id": parametersUrl[1]})
			.then(result =>{
				if(result && result._id){
					return res.status(200).json({body: { status: "success", data: result}});
				}else{
					return res.status(200).json({status: 'failure', message: "No record found or token has expired"});
				}
			}).catch((err)=>{
				res.status(200).json({status: 'failure', message: err});
		});
	});


	app.post("/v1/user/recoverPassword", function(req, res){
		let globalUser;
		 User.findOne({email: req.body.email}).then(user => {
			globalUser = user;
			if(user && user._id){
				return createRecoveryAccountToken(user);
			}else{
				console.log("fake response", req.body);
				res.status(200).json({body: { status: "success"}});
			}
		 }).then(async activations =>{
			res.status(200).json({body: { status: "success"}});
			try{
				let token = activations.activation_token + '|' + activations._id;                                           
				let emailMeta = {
					"templateName": "ForgotPassword",
					"transport" : "sendgrid",
					"from" : "no-reply@pushdeploy.io", 
					"to" : globalUser.email,
					"subject":"Pushdeploy Account Password Reset",
					"emailbody" : {
						token: `${AppConfig.dashboardURL}/reset-password/${token}`,
						username: globalUser.name,
						company: 'Pushdeploy.io'
					}
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
		 }).catch(err => {
			console.log({err});
			res.status(200).json({body: { status: "success"}});
		 });
	 });
		 


	let createRecoveryAccountToken = (user) =>{
		let seed = crypto.randomBytes(20);
    	let authToken = crypto.createHash('sha1').update(user.email).digest('hex');
		return Activation.create({"email": user.email, uid: user.uid, "password":user.password, "activation_token":authToken, 'type': 'password-recovery'})
	};

	let deletePasswordRecovery = (query) =>{
		return Activation.delete(query);
	};

	app.post("/v1/user/resetPassword", (req, res) => {
		let { newpassword = "", email=""} = req.body;

		if(newpassword !== req.body.cpassword){
			return res.status(401).json({status: 'failure', message: "Passwords do not match"});
		}else if(newpassword.length < 6) {
			return res.status(401).json({status: 'failure', message: "Passwords must be 6 character in length"});
		}
	 
		User.findOne({ email: email }).then(user => {
			if (user && user._id) {
				let newHashpassword = hash(newpassword);
				if(newHashpassword === user.password){
					return res.status(200).json({body: { status: "failure", message: "Your old password cannot be the same with your new password"}});
				}
				return User.update({update: { password: newHashpassword }, 
					query: {uid: user.uid}});
			}else{
				return res.status(200).json({body: { status: "failure", message: "this user account is invalid"}});
			}
		}).then(async updatedModel =>{
			res.status(200).json({body: {status: "success"}});
			try{
				let emailMeta = {
					"templateName": "passwordChangeSuccess",
					"transport" : "sendgrid",
					"from" : "no-reply@pushdeploy.io", 
					"to" : updatedModel.email,
					"subject":"Pushdeploy Password Change",
					"emailbody" : {
						username: updatedModel.name
					}
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
				await deletePasswordRecovery({"email": email, 'type': 'password-recovery'});
			}catch(err){
				console.log("emailManagement:", err.message);
			}			
		});
	 });
	 
};