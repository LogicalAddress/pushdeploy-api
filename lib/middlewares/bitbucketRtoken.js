var _ = require('underscore');
var UserAuthCredential = require("../launcher/UserAuthCredential");
var request = require("request"),
AppConfig = require('../../config/app');

module.exports = function (req, res, next)
{
	if(req.body.git_provider !== "bitbucket") {
		console.log("bitbucketRtoken: Move to next(), this aint bitbucket");
		next();
		return;
	}
	
	UserAuthCredential.findByUID(req.techpool.user.uid).then((AuthCred)=>{
		var json = {
			client_id: AppConfig.OAuth.bitbucket.publicKey, 
	        client_secret: AppConfig.OAuth.bitbucket.secretKey,
	        grant_type: 'refresh_token',
	        refresh_token: AuthCred.bitbucket_refresh_token
	      };
	      
	    if(false/*TODO: Bitbucket Token Has Not Expired*/){
	    	req.techpool = req.techpool || {};
			req.techpool.credentials = AuthCred;
		    next();
	    	return;
	    }
		request.post({
	    	url: 'https://bitbucket.org/site/oauth2/access_token',
	    	headers: {
	    		'Accept': 'application/json', 
	    	}, json: json, }, (error, response, body) => {
	    	if (error){
	    	  console.log("Bitbucket Response, RefreshToken", error);
	    	  res.status(500).json({status: 'failure', message: "Refresh Token: Unexpected Response from bitbucket.org"});
	    	  return;
	    	}
	    	if(body && body.access_token){
	    	  console.log("RefreshToken Response", body);
	    	  AuthCred.access_token = body.access_token;
	    	  AuthCred.save().then((update)=>{
	    	  	console.log("UserAuthCredentials Updated", update);
	    	  }).catch((error)=>{
	    	  	console.log("UserAuthCredentials update Err", error);
	    	  });
	    	  req.techpool = req.techpool || {};
			  req.techpool.credentials = AuthCred;
		      next();
	    	}else{
	    	  console.log("Refresh Token", "Refresh Token: Unexpected Response from bitbucket.org");
	    	  res.status(500).json({status: 'failure', message: "Refresh Token: Unexpected Response from bitbucket.org"});
	    	  return;
	    	}
	    });
	}).catch((error)=>{
		console.log(error);
	    res.status(500).json({status: 'failure', message: "User Authentication Credential Query Failed"});
	    return;
	});

};