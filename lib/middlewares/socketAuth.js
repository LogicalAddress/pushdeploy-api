var _ = require('underscore');
var User = require('../User');

module.exports = function (socket, next)
{
	var access_token = socket.handshake.query.token;
    if (_.isString(access_token) && access_token.length) {
    	var decoded = User.token2Object(access_token);
    	if (_.isObject(decoded) && _.has(decoded, 'user')) {
    		socket.user = decoded.user || {};
    		next();
    	}else{
    		next({
				"status": "failure",
				"message": "Access Token Expired"
			});
    	}
    }else {
    	next({
			"status": "failure",
			"message": "Access Token Expired"
		});
  	} 

};