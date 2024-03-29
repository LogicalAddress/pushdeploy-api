var laeh = require('laeh2').leanStacks(true), _x = laeh._x,
AppConfig = require('../../../config/app'),
sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
rollback = require("../appRollback"),
fs = require("fs"),
breakUrl = require('parse-github-repo-url'), //[user, repo, version] = parse(url)
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

var addSetup =  function(req, _server, _app, redo, retryAttempt = 1){
	console.log("appSetup.js","ORIGINAL REQ", req.body);
	try{
		opts.host = _server.ipv4;
		opts.username = _server.superuser || 'ubuntu';
		if(_server.provider === "custom"){
			opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
		}else if(_server.provider === "aws"){
			opts.privateKey = _server.private_key;
		}else if(_server.provider === "linode"){
			opts.privateKey = _server.private_key;
		}else{
			throw new Error("Invalid Server Provider. How did we get here?");
		}
		// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
		var visibility = (req.body.repo_meta_data.isPublic ? "public" : "private");
		var gitToken = "", repoUser = "", repoProject = "";
		var project = breakUrl(req.body.app_repository);
		repoUser = project[0] || "";
		repoProject = project[1] || "";
		console.log("Auth Check", req.body.git_provider, req.techpool.credentials);
		if(req.body.git_provider === "github"){
			gitToken = req.techpool.credentials.github_token || "";
			console.log("github_token", gitToken);
		}else
		if(req.body.git_provider === "bitbucket"){
			gitToken = req.techpool.credentials.bitbucket_token || "";
			console.log("bitbucket", gitToken);
		}else if(visibility === "private"){
			console.log("No Git Credential available, WTF allowed this request ");
			console.log("Public", req.body.repo_meta_data.isPublic,"visibility", visibility);
			if(!redo){
				rollback(req, _app);
			}
			return;
		}else{
			console.log("else case");
		}


		opts.session = [
			{ op: 'writeFile', path: '/home/'+opts.username+'/.setup.sh', body: fs.readFileSync(__dirname + '/../../../cargoshell/cargoshell_ubuntu_16.04.sh') },
	        { op: 'exec', command: 'chmod +x /home/'+opts.username+'/.setup.sh' },
	        { op: 'exec', canFail: false, command: 'export USERCARGOSPACEPUBKEY="'+req.techpool.credentials.custom_public_key+'" REPO_PROJECT_NAME='+repoProject+' REPO_USER='+repoUser+' SERVER_NAME='+_server.server_name+' USER_OAUTH_TOKEN='+gitToken+' REPO_VISIBILITY='+visibility+' GIT_PROVIDER='+req.body.git_provider+' SERVER_ID='+_server._id+' CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/server/events ACTION=add_app SERVER_ENTRY_POINT='+req.body.entry_point+' APP_NAME='+_app.app_name+' APP_ID='+_app._id+' PORT='+ (3000 + parseInt(_server._app_counter))+' TEMPLATE='+_app.template+' NODE_VERSION='+_app.template_variation+' REPOSITORY="'+_app.app_repository+'" && /home/'+_server.superuser+'/.setup.sh >.app_'+_app.app_name+'.log.out 2>&1' },
	    ];
	    
	    console.log("calling sshclient");
		sshclient.session(opts, _x(function(err, response){
			//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
			console.log("remote server error", err, response);
			if(err && !redo){
				if(retryAttempt == 5){
					rollback(req, _app);
					try{
						req.io.to(_app.uid).emit('CREATE_APP_FAILED', _app);
					}catch(err){
						console.log("socket.io failed", err.message);
					}
				}else{
					console.log("Retrying to add_app via SSH", {retryAttempt},{redo});
					return addSetup(req, _server, _app, redo, retryAttempt + 1);
				}
			}
		}, true, function(err, data) {
			// Control reaches here when cargoshell returns a zero EXIT_STATUS
			console.log(err);
			if(err && !redo){
				rollback(req, _app);
				return;
			}
			try{
				req.io.to(_app.uid).emit('CREATE_APP_SUCCESS', _app);
			}catch(err){
				console.log("socket.io failed", err.message);
			}
		    console.log('CREATE_APP', 'DONE');
		}));
	}catch(error){
		console.log("Exception Thrown", error);
		if(!redo){
			rollback(req, _app);
		}
	}
};

module.exports = addSetup;