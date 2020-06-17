var DNS = require('../../lib/dns/index.js');
var AppConfig = require('../../config/app');

module.exports = function (req, res, next)
{
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
        if(data){
            return next();
        }else{
            return res.status(400).json({status: 'failure', message: "Upgrade! You have exceeded your DNS limit"});
        }
    }).catch((error)=>{
        return res.status(400).json({status: 'failure', message: error.message});
    });
};