var breakUrl = require('parse-github-repo-url'); //[user, repo, version] = parse(url)
var request = require("request");

var _githubRepoProfile = function(repo, authCred){
    return Promise((resolve, reject)=>{
        var tokens = breakUrl(repo), 
        url = 'https://api.github.com/repos/'+tokens[0]+'/'+tokens[1];
        //https://developer.github.com/v3/repos/#get
        request.get({
        	url,
        	headers: {
        		'Accept': 'application/vnd.github.v3+json', 
        		'Authorization': 'token ' + authCred.github_token,
        		'User-Agent': 'dretnan'
        	},
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
        	  return resolve({
        	      repo,
        	      isOwner: body.owner.login == authCred.github_username,
        	      isPublic: !body.private,
        	      hasRead: (!body.private || 
        	        body.owner.login == authCred.github_username || 
        	        body.permissions.admin || body.permissions.pull)
        	  });
        	}else{
        	  console.log("Remote Repo Info", error);
        	  return reject("Bad Response from the server");
        	}
        });
    })
};

var _bitbucketRepoProfile = function(repo, authCred){
    
};

module.exports = {
    getRepoDetails: function(load, authCred){
        return Promise((resolve, reject)=>{
            if(load.git_provider == "github"){
                _githubRepoProfile(load.app_repository, authCred).then((response)=>{
                   return resolve(response);
                }).catch((error)=>{
                    return reject(error);
                });
            }else if(load.git_provider == "bitbucket"){
                _bitbucketRepoProfile(load.app_repository, authCred).then((response)=>{
                   return resolve(response);
                }).catch((error)=>{
                    return reject(error);
                });
            }else{
                throw new Error("Unsuported git provider");
            }
        }); 
    }
}