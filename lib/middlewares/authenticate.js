var _ = require('underscore');
var User = require('../User');

module.exports = function (req, res, next)
{
	var access_token = (req.body && req.body.access_token) || 
	(req.query && req.query.access_token) || 
	req.headers['x-access-token'] || req.headers['x-auth-token'];
    if (_.isString(access_token)) {
		var decoded = User.token2Object(access_token);
    	if (_.isObject(decoded) && _.has(decoded, 'user')) {
    		req.techpool = req.techpool || {};
    		req.techpool.user = decoded.user;
    		req.techpool.user.access_token = access_token;
    		next();
    	}else{
    		res.status(400);
			return res.json({
				"status": "failure",
				"message": "Your access is expired"
			});
    	}
    }else {
	    res.status(400);
	    return res.json({
	      "status": "failure",
	      "message": "Your access is expired",
	      url: req.originalUrl,
	    });
  	} 

};