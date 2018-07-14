var breakUrl = require('parse-github-repo-url'); //[user, repo, version] = parse(url)
var request = require("request");

var _githubRepoProfile = function(repo, authCred){
    console.log("Github detected");
    return new Promise((resolve, reject)=>{
        var tokens = breakUrl(repo), 
        url = 'https://api.github.com/repos/'+tokens[0]+'/'+tokens[1];
        var headers = {
    		'Accept': 'application/vnd.github.v3+json', 
    		'User-Agent': 'dretnan'
        };
        if(authCred.github_token){
            headers.Authorization = 'token ' + authCred.github_token;
            console.log("token header added");
        }else{
            console.log("without token");
        }
        //https://developer.github.com/v3/repos/#get
        request.get({
        	url,
        	headers,
        	json: {},
        },
        (error, response, body) => {
            console.log(url);
            if (error){
        	  console.log("Remote Repo Info", error);
        	  return reject(error);
        	}
        	if(body && body.id){
        	  console.log("Remote Repo Info", body);
        	  var res = {
        	      repo,
        	      repo_json: body,
        	      isOwner: body.owner.login == authCred.github_username,
        	      isPublic: !body.private,
        	      hasRead: !body.private,
        	  };
        	  if(authCred.github_token){
        	      res.hasRead = body.permissions.admin || 
        	        body.permissions.pull || 
        	        body.owner.login == authCred.github_username || 
        	        res.hasRead;
        	  }
        	  return resolve(res);
        	}else{
        	  console.log("Remote Repo Info", error);
        	  /*{ //If Accessed without Token
                  "message": "Not Found",
                  "documentation_url": "https://developer.github.com/v3/repos/#get"
                }
                */
                if(body && body.message == "Not Found"){
            	  return resolve({
            	      repo,
            	      repo_json: null,
            	      isOwner: false,
            	      isPublic: false,
            	      hasRead: false,
            	  });
                }
        	  return reject("Bad Response from the server");
        	}
        });
    });
};

var _bitbucketRepoProfile = function(repo, authCred){
    console.log("Bitbucket Detected");
};

module.exports = function(load, authCred)
{
    return new Promise((resolve, reject)=>{
        if(load.git_provider == "github"){
            console.log("github");
            _githubRepoProfile(load.app_repository, authCred).then((response)=>{
               return resolve(response);
            }).catch((error)=>{
                return reject(error);
            });
        }else if(load.git_provider == "bitbucket"){
            console.log("bitbucket");
            _bitbucketRepoProfile(load.app_repository, authCred).then((response)=>{
               return resolve(response);
            }).catch((error)=>{
                return reject(error);
            });
        }else{
            reject("Unsuported git provider");
        }
    });
};