var UserAuthCredential = require("../../lib/launcher/UserAuthCredential");
var Auth = require("../../lib/middlewares/authenticate");
var request = require("request");
var AppConfig = require("../../config/app");


function getUserProfile(github){
	return new Promise((resolve, reject)=>{
		let url = 'https://api.github.com/user';
        let headers = {
    		'Accept': 'application/vnd.github.v3+json', 
    		'User-Agent': 'pushdeployd',
    		'Authorization': 'token ' + github.access_token,
        };
		request.get({
        	url,
        	headers,
        	json: {},
        },
        (error, response, body) => {
            console.log(url);
            if (error){
        	  return reject(error);
        	}
        	if(body && body.id){
        	  console.log("github UserProfile", body);
        	  return resolve({
        	  	github_username: body.login,
        	  	github_token: github.access_token,
        	  	github_scope: github.scope,
        	  	github_token_type: github.token_type,
        	  	github_raw: JSON.stringify(body)
        	  });
        	}else{
        	  return reject("Bad Response from the server");
        	}
        });

	});
}

module.exports = function (app) {
	app.post('/v1/oauth2/github/create', Auth, function (req, res, next) {
		if(!req.body.code){
			return res.status(500).json({status: 'failure', message: "code not sent"});
		}
		request.post({
        	url: 'https://github.com/login/oauth/access_token',
        	headers: {
        	    'Accept': 'application/json', 
    		    // 'User-Agent': 'pushdeployd'
        	},
        	json: {
        	   client_id: AppConfig.OAuth.github.publicKey,
        	   client_secret: AppConfig.OAuth.github.secretKey,
        	   code: req.body.code,
        	},
        },
        (error, response, body) => {
            if (error){
        	  console.log("Github OAuth2 Error", error, body);
        	  return res.status(200).json({body: { status: "failure", message: "Github Error"}});
        	}
        	if(body && body.access_token){
        	  	console.log("Github OAuth2 response", body);
        	  	getUserProfile(body).then((response)=>{
        	  		UserAuthCredential.update({query: {
						uid: req.techpool.user.uid
					}, update: response}).then((record)=>{
						res.status(200).json({body: { status: "success", data: record}});
					}).catch((error)=>{
					    res.status(200).json({status: 'failure', message: error});
					});	
        	  	}).catch((error)=>{
        	  		res.status(200).json({status: 'failure', message: error});
        	  	});
        	}else{
        	  console.log("Github OAuth2 Error:", error, body);
        	  return res.status(200).json({body: { status: "failure", message: "Unexpected message from github"}});
        	}
        });
	});

	app.post('/webhooks/github', Auth, function (req, res, next) {
		console.log("RECV Github WebHooks!", req.body);		
		return res.status(200).json({body: { status: "recv"}});	
	});
};