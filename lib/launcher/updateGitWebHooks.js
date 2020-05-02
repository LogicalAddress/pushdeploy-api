var breakUrl = require('parse-github-repo-url'); //[user, repo, version] = parse(url)
var request = require("request");
var AppConfig = require("../../config/app");

var updateGithubWebhook = function(state, repo, authCred, webhookId){
    console.log("Github detected");
    return new Promise((resolve, reject)=>{
        var tokens = breakUrl(repo), 
        url = 'https://api.github.com/repos/'+tokens[0]+'/'+tokens[1]+'/hooks/'+webhookId;
        request.del({
        	url,
        	headers: {
        	    Authorization: 'token ' + authCred.github_token,
        	    'Accept': 'application/vnd.github.v3+json', 
    		    'User-Agent': 'pushdeployd'
        	},
        	json: null
        },
        (error, response, body) => {
         //    console.log(url);
         //    if (error){
        	//   console.log("WebHook Error", error, body);
        	//   return reject(error);
        	// }
    	  return resolve({status: true, data: body});
        });
    });
};

var updateBitbucketWebhook = function(state, repo, authCred, webhookId){
    console.log("Bitbucket Detected, Not-Implemented"); //TODO:
};

module.exports = function(app, authCred)
{
    return new Promise((resolve, reject)=>{
        if(app.git_provider == "github"){
            console.log("github");
            updateGithubWebhook(app.auto_deploy, app.app_repository, authCred, 
                app.webhook_sub_id).then((response)=>{
               return resolve(response);
            }).catch((error)=>{
                return reject(error);
            });
        }else if(app.git_provider == "bitbucket"){
            console.log("bitbucket");
            updateBitbucketWebhook(app.auto_deploy, app.app_repository, 
                authCred, app.webhook_sub_id).then((response)=>{
               return resolve(response);
            }).catch((error)=>{
                return reject(error);
            });
        }else{
            reject("Unsuported git provider");
        }
    });
};