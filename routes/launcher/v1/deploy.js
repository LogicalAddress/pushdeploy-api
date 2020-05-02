var Auth = require("../../../lib/middlewares/authenticate"), 
laeh = require('laeh2').leanStacks(true), _x = laeh._x,
sshclient = require("sshclient"),
UserApp = require('../../../lib/launcher/UserApps'), 
AppDeployLog = require('../../../lib/launcher/AppDeployLog'), 
Cred = require("../../../lib/middlewares/credentials"),
AppConfig = require('../../../config/app'),
breakUrl = require('parse-github-repo-url'), //[user, repo, version] = parse(url)
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function (app, socketIO) {
	
	app.post('/v1/app/deploy', Auth, Cred, (req, res, next) => {
		UserApp.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.app_id
		}).then((response)=>{
			var _app = response;
			try{
				console.log("deploying..", _app);
				opts.host = _app.server.ipv4;
				opts.username = _app.server.username || 'ubuntu';
				// opts.privateKey = req.techpool.credentials.custom_private_key;
				// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
				if(_app.server.provider === "custom"){
					opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
				}else if(_app.server.provider === "aws"){
					opts.privateKey = _app.server.private_key;
				}else{
					throw new Error("Invalid Server Provider. How did we get here?");
				}
				var visibility = (_app.isPublic ? "public" : "private");
				var gitToken = "", repoUser = "", repoProject = "";
				var project = breakUrl(_app.app_repository);
				repoUser = project[0] || "";
				repoProject = project[1] || "";
				console.log("Auth Check", _app.git_provider, req.techpool.credentials);
				if(_app.git_provider === "github"){
					gitToken = req.techpool.credentials.github_token || "";
					console.log("github_token", gitToken);
				}else
				if(_app.git_provider === "bitbucket"){
					gitToken = req.techpool.credentials.bitbucket_token || "";
					console.log("bitbucket", gitToken);
				}else if(visibility === "private"){
					console.log("No Git Credential available, WTF allowed this request ");
					console.log("Public", _app.isPublic,"visibility", visibility);
					res.status(500).json({body: { status: "failure", message: "Server issues: Unable to deploy app" }});
					return;
				}else{
					console.log("else case: continue regardless");
				}
				opts.session = [
					{ op: 'exec', command: 'export REPO_PROJECT_NAME='+repoProject+' REPO_USER='+repoUser+' SERVER_NAME='+_app.server.server_name+' USER_OAUTH_TOKEN='+gitToken+' REPO_VISIBILITY='+visibility+' GIT_PROVIDER='+_app.git_provider+' SERVER_ID='+_app.server._id+' CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/server/events ACTION=deploy APP_NAME='+_app.app_name+' APP_ID='+_app._id+' NODE_VERSION='+_app.template_variation+' REPOSITORY="'+_app.app_repository+'" && /home/'+_app.server.superuser+'/.setup.sh >.app_'+_app.app_name+'.log.out 2>&1' },
			    ];
				sshclient.session(opts, _x(function(err, response){
					//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
					console.log("Authentication Problems probably", err, response);
					if(err){
						console.log(err, _app);
						res.status(500).json({body: { status: "failure", message: "Server issues: Unable to deploy" }});
						AppDeployLog.create({
							uid: _app.uid,
							app: _app._id,
							server: _app.server._id,
							status: 'failed',
							app_name: _app.app_name,
							deploy_type: 'manual',
							message: 'Server issues: Unable to deploy'
						}).then((res)=>{
							console.log("deployLogs created");
						}).catch((err)=>{
							console.log("deployLogError", err);
						});
						return;
					}
				}, true, function(err, data) {
					// Control reaches here when cargoshell returns a zero EXIT_STATUS
					if(err){
						console.log(err, _app.server);
						res.status(500).json({body: { status: "failure", message: "Unable to deploy" }});
						AppDeployLog.create({
							uid: _app.uid,
							app: _app._id,
							server: _app.server._id,
							status: 'failed',
							app_name: _app.app_name,
							deploy_type: 'manual',
							message: 'Unable to deploy'
						}).then((res)=>{
							console.log("deployLogs created");
						}).catch((err)=>{
							console.log("deployLogError", err);
						});
						return;
					}
					res.status(200).json({body: { status: "success", data: app }});
				    console.log('DEPLOY', 'DONE', _app);
				    AppDeployLog.create({
						uid: _app.uid,
						app: _app._id,
						server: _app.server._id,
						status: 'success',
						app_name: _app.app_name,
						deploy_type: 'manual',
					}).then((res)=>{
						console.log("deployLogs created");
					}).catch((err)=>{
						console.log("deployLogError", err);
					});
				    return;
				}));
			}catch(error){
				console.log("Exception Thrown", error);
				res.status(500).json({body: { status: "failure", message: "Unable to deploy" }});
				AppDeployLog.create({
					uid: _app.uid,
					app: _app._id,
					server: _app.server._id,
					status: 'failed',
					app_name: _app.app_name,
					deploy_type: 'manual',
					message: 'Exception: Unable to deploy'
				}).then((res)=>{
					console.log("deployLogs created");
				}).catch((err)=>{
					console.log("deployLogError", err);
				});
				return;
			}
			
		}).catch((error)=>{
			console.log("FATAL ERROR", error);
		    res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		    return;
		});	
		
	});
};