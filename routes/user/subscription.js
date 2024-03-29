var Auth = require("../../lib/middlewares/authenticate");
var User = require("../../lib/User");
var subModel = require("../../lib/launcher/Subscriptions");
var config = require("../../config/app");
var emailManagement = require('../../lib/emailManagement');

module.exports = function (app) {
	// app.post('/v1/subscribe', Auth, function (req, res, next) {
	//     console.log("DEBUG", req.body);
	// 	User.update({update: { primaryPlan: req.body.selectedPlan}, 
	// 	    query: {uid: req.techpool.user.uid}})
	// 	 .then((record)=>{
	// 		res.status(200).json({body: { status: "success", data: "ok"}});
	// 		subModel.create({
	// 		    uid: record.uid,
	// 		    raw: JSON.stringify(req.body),
	// 		    name: req.techpool.user.name,
	// 		    plan: req.body.selectedPlan,
	// 		    email: req.techpool.user.email,
	// 		    mobileNumber: req.techpool.user.mobileNumber,
	// 		    amount: req.body.amount
	// 		}).then((response)=>{
	// 		    console.log("DEBUG", response);
	// 		}).catch((err)=>{
	// 		    console.log(err);
	// 		});
	// 	}).catch((error)=>{
	// 	    res.status(500).json({status: 'failure', message: error});
	// 	});			
	// });

	app.post('/v1/cancelSubscription', Auth, async function (req, res, next) {

		try{
			let user = await User.findOne({email: req.techpool.user.email});

			const stripe = require('stripe')(config.payment.stripeSecretKey);
			stripe.subscriptions.del(user.last_subscriptionId);

			await User.update({update: { noSubscription: true, primaryPlan: ''}, 
				query: {email: req.techpool.user.email}});

			user = await User.findById(req.techpool.user._id); //returnable user object TODO: uptimize

			res.status(200).json({body: { status: "success", data: user}});
			try{
				let emailMeta = {
					"templateName": "SubscriptionDeleted",
					"transport" : "sendgrid",
					"from" : "no-reply@pushdeploy.io", 
					"to" : user.email,
					"subject":"Pushdeploy Subscription Deletion",
					"emailbody" : {
						Username: user.name,    
					}
				}     
				let result = await emailManagement.sendEmail(emailMeta);
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
            }catch(error){
                    console.log("emailManagement", {error});
            }
            return;
		}catch(error){
			console.log("unable to cancel subscription manualy, die silently..", error.message);
			res.status(500).json({status: 'failure', message: error});
		}

	});

	app.post('/v1/tryFree', Auth, async function (req, res, next) {

		try{
			let user = await User.findOne({email: req.techpool.user.email});

			await User.update({update: { tryFree: true }, 
				query: {email: req.techpool.user.email}});

			user = await User.findById(req.techpool.user._id); //returnable user object TODO: uptimize

			return res.status(200).json({body: { status: "success", data: user}});
		}catch(error){
			console.log("unable to cancel subscription manualy, die silently..", error.message);
			res.status(500).json({status: 'failure', message: error});
		}

	});

};