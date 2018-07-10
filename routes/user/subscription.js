var Auth = require("../../lib/middlewares/authenticate");
var User = require("../../lib/User");
var subModel = require("../../lib/launcher/Subscriptions");

module.exports = function (app) {
	app.post('/v1/subscribe', Auth, function (req, res, next) {
	    console.log("DEBUG", req.body);
		User.update({update: { primaryPlan: req.body.selectedPlan}, 
		    query: {uid: req.techpool.user.uid}})
		 .then((record)=>{
			res.status(200).json({body: { status: "success", data: "ok"}});
			subModel.create({
			    uid: req.techpool.user.uid,
			    raw: JSON.stringify(req.body),
			    name: req.techpool.user.name,
			    plan: req.body.selectedPlan,
			    email: req.techpool.user.email,
			    mobileNumber: req.techpool.user.mobileNumber,
			    amount: req.body.amount
			}).then((response)=>{
			    console.log("DEBUG", response)
			}).catch((err)=>{
			    console.log(err);
			})
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};