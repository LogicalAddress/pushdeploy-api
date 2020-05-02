var breakUrl = require('parse-github-repo-url'); //[user, repo, version] = parse(url)
var request = require("request");
var AppConfig = require("../../config/app");

var createGithubWebhook = function(state, repo, authCred){
    console.log("Github detected");
    return new Promise((resolve, reject)=>{
        var tokens = breakUrl(repo), 
        url = 'https://api.github.com/repos/'+tokens[0]+'/'+tokens[1]+'/hooks';
        request.post({
        	url,
        	headers: {
        	    Authorization: 'token ' + authCred.github_token,
        	    'Accept': 'application/vnd.github.v3+json', 
    		    'User-Agent': 'pushdeployd'
        	},
        	json: {
        	    name: 'web',
        	    events: ['push', 'repository'],
        	    config: {
        	        url: AppConfig.GitWebHookUrl + '/webhooks/github', //TODO:
        	        content_type: 'json',
        	        active: !state,
        	    }
        	},
        },
        (error, response, body) => {
            console.log(url);
            if (error){
        	  console.log("WebHook Error", error, body);
        	  return reject(error);
        	}
        	if(body && body.id){
        	  console.log("WebHook response", body);
        	  return resolve({status: true, webhook_id: body.id, data: body});
        	}else{
        	  console.log("Github WebHook Err:", error, body);
        	  return reject("Bad Response from the server");
        	}
        });
    });
};

var createBitbucketWebhook = function(repo, authCred){
    console.log("Bitbucket Detected");
};

module.exports = function(app, authCred)
{
    return new Promise((resolve, reject)=>{
        if(app.git_provider == "github"){
            console.log("github");
            createGithubWebhook(app.auto_deploy, app.app_repository, authCred).then((response)=>{
               return resolve(response);
            }).catch((error)=>{
                return reject(error);
            });
        }else if(app.git_provider == "bitbucket"){
            console.log("bitbucket");
            createBitbucketWebhook(app.auto_deploy, app.app_repository, authCred).then((response)=>{
               return resolve(response);
            }).catch((error)=>{
                return reject(error);
            });
        }else{
            reject("Unsuported git provider");
        }
    });
};