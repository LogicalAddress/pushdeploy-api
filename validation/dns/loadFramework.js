/**
 * @module CreateZone
 */

var AppConfig = require('../../config/app');
 
module.exports = function (req, res, next)
{
    req.techpool = req.techpool || {};
    req.techpool.dns = req.techpool.dns || {};
    req.techpool.dns.framework = AppConfig.ClientSetting.dnsFramework;
    if(AppConfig.ClientSetting.enableDns){
        next();
    }else{
        return res.status(400).json({status: 'failure', message: "DNS is under maintenance.."});
    }
};