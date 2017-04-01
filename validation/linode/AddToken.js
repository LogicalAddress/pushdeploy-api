/**
 * @module CreateZone
 */

var _ = require('underscore');
 
module.exports = function (req, res, next)
{
    var access_token = (req.body && req.body.access_token) || 
	(req.query && req.query.access_token) || 
	req.headers['x-access-token'] || req.headers['x-auth-token'];    
    if (_.isEmpty(access_token)) {
        return res.status(500).json({message: "Access Toke is required"});
    }else{
        if(!_.isObject(req.body)){
            _.extend(req, {body: {}});
        }
        _.extend(req.body, {token: access_token});
        next();
    }
};