var DNS = require('../../lib/dns/index.js');
var Auth = require("../../lib/middlewares/authenticate"),
Cred = require("../../lib/middlewares/credentials");
var AppConfig = require('../../config/app');

	
module.exports = function (app, io) {

	app.get('/v1/dnspassflag', Auth, Cred, (req, res, next) => {
		return DNS.countZone({uid: req.techpool.user.uid}).then((count)=>{
            let data = false;
            if(req.techpool.user.primaryPlan === AppConfig.ClientSetting.stripePlanA)
            {
                if(count < 10){ //Limit for pushdeploy test plan
                    data = true;
                }
            }else if(req.techpool.user.primaryPlan === AppConfig.ClientSetting.stripePlanAA)
            {
                if(count < 30){
                    data = true;
                }
            }else if (req.techpool.user.primaryPlan === AppConfig.ClientSetting.stripePlanB ||
                req.techpool.user.primaryPlan === AppConfig.ClientSetting.stripePlanBB)
            {
                data = true;
            }else if(req.techpool.user.tryFree && req.techpool.user.primaryPlan.length === 0){
                if(count < 1){
                    data = true;
                }
            }
    		return res.status(200).json({body: { status: "success", data}});
    	}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});
	
};