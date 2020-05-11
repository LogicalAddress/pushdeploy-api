var UserAuthCredential = require("../../lib/launcher/UserAuthCredential");
var Auth = require("../../lib/middlewares/authenticate");
var request = require("request");
var AppConfig = require("../../config/app");
var moment = require("moment");

function getUserProfile(linode){
	return new Promise((resolve, reject)=>{
		let url = 'https://api.linode.com/v4/profile';
        let headers = {
    		'Accept': 'application/json', 
    		'User-Agent': 'pushdeployd',
    		'Authorization': 'Bearer ' + linode.access_token,
        };
		request.get({
        	url,
        	headers,
        	json: {},
        },
        (error, response, body) => {
 
            if (error){
				console.log("Linode getUserProfile", {error});
        	  	return reject(error);
        	}
        	if(body && body.uid){
				let expiryDate = moment(new Date());
				expiryDate = expiryDate.add(moment.duration(linode.expires_in, 'seconds'));
				let linode_token_expiry_date = expiryDate.toDate();
        	  return resolve({
                linode_username: body.username,
                linode_email: body.email || "",
                linode_token: linode.access_token,
				linode_token_expiry: linode.expires_in,
				linode_token_expiry_date,
                linode_scope: linode.scope,
                linode_refresh_token: linode.refresh_token || '',  
        	  	linode_token_type: linode.token_type,
        	  	linode_raw: JSON.stringify(body)
        	  });
        	}else{
        	  return reject("Bad Response from the server");
        	}
        });

	});
}

module.exports = function (app) {
	app.post('/v1/oauth2/linode/create', Auth, function (req, res, next) {
		if(!req.body.code){
			return res.status(500).json({status: 'failure', message: "code not sent"});
		}
		request.post({
        	url: 'https://login.linode.com/oauth/token',
        	headers: {
        	    'Accept': 'application/json', 
                // 'User-Agent': 'pushdeployd'
                'Content-Type':'application/x-www-form-urlencoded'
        	},
        	form: {
        	   client_id: AppConfig.OAuth.linode.publicKey,
        	   client_secret: AppConfig.OAuth.linode.secretKey,
        	   code: req.body.code,
        	},
        },
        (error, response, body) => {
            if (error){
        	  console.log("Linode OAuth2 Error", error, body);
        	  return res.status(200).json({body: { status: "failure", message: "Linode Error"}});
            }
            body = JSON.parse(body);
        	if(body && body.access_token){
        	  	console.log("linode OAuth2 response", body);
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
        	  console.log("Linode OAuth2 Error 2:", error, body);
        	  return res.status(200).json({body: { status: "failure", message: "Unexpected message from linode"}});
        	}
        });
	});
};