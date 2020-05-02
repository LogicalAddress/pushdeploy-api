var laeh = require('laeh2').leanStacks(true), _x = laeh._x,
sshclient = require("sshclient"),
UserApp = require('../../../lib/launcher/UserApps'),
AppDeployLog = require('../../../lib/launcher/AppDeployLog'),
AppConfig = require('../../../config/app'),
breakUrl = require('parse-github-repo-url'), //[user, repo, version] = parse(url)
userAuthCredential = require('../../../lib/launcher/UserAuthCredential'),
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function (app, socketIO) {
	
	app.post('/webhooks/github', (req, res, next) => {
		res.status(200).json({message: "ACK"}); //return early
		if(req.body.hook){
			console.log("Github AutoDeploy Registered", req.body);
			// return;
		}

		if(!req.body.repository){
			console.log("False positive event", req.body);
			return;
		}

		UserApp.findAllBy({
			repo_id: req.body.repository.id,
		}).then(async(response)=>{
			for(let i = 0; i < response.length; i++){
				var _app = response[i];
			// if(req.body.repository){
				try{
					console.log("deploying..", _app);
					let credentials = await userAuthCredential.findByUID(_app.uid);
					opts.host = _app.server.ipv4;
					opts.username = _app.server.username || 'ubuntu';
					// opts.privateKey = req.techpool.credentials.custom_private_key;
					// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
					if(_app.server.provider === "custom"){
						opts.privateKey = credentials.custom_private_key;//TODO: Copy to _server during setup for custom
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
					console.log("Auth Check", _app.git_provider, credentials);
					if(_app.git_provider === "github"){
						gitToken = credentials.github_token || "";
						console.log("github_token", gitToken);
					}else
					if(_app.git_provider === "bitbucket"){
						gitToken = credentials.bitbucket_token || "";
						console.log("bitbucket", gitToken);
					}else if(visibility === "private"){
						console.log("No Git Credential available, WTF allowed this request ");
						console.log("Public", _app.isPublic,"visibility", visibility);
						throw new Error("Server issues: Unable to deploy app");
					}else{
						console.log("else case: continue regardless");
					}
					opts.session = [
						{ op: 'exec', command: 'export REPO_PROJECT_NAME='+repoProject+' REPO_USER='+repoUser+' SERVER_NAME='+_app.server.server_name+' USER_OAUTH_TOKEN='+gitToken+' REPO_VISIBILITY='+visibility+' GIT_PROVIDER='+_app.git_provider+' SERVER_ID='+_app.server._id+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/events ACTION=deploy APP_NAME='+_app.app_name+' APP_ID='+_app._id+' NODE_VERSION='+_app.template_variation+' REPOSITORY="'+_app.app_repository+'" && /home/'+_app.server.superuser+'/.setup.sh >.app_'+_app.app_name+'.log.out 2>&1' },
				    ];
					sshclient.session(opts, _x(function(err, response){
						//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
						console.log("Authentication Problems probably", err, response);
						if(err){
							console.log(err, _app);
							AppDeployLog.create({
								uid: _app.uid,
								app: _app._id,
								server: _app.server._id,
								status: 'failed',
								app_name: _app.app_name,
								deploy_type: 'auto',
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
							AppDeployLog.create({
								uid: _app.uid,
								app: _app._id,
								server: _app.server._id,
								status: 'failed',
								app_name: _app.app_name,
								deploy_type: 'auto',
								message: 'Unable to deploy'
							}).then((res)=>{
								console.log("deployLogs created");
							}).catch((err)=>{
								console.log("deployLogError", err);
							});
							return;
						}
						AppDeployLog.create({
							uid: _app.uid,
							app: _app._id,
							server: _app.server._id,
							status: 'success',
							app_name: _app.app_name,
							deploy_type: 'auto',
						}).then((res)=>{
							console.log("deployLogs created");
						}).catch((err)=>{
							console.log("deployLogError", err);
						});
				    	console.log('DEPLOY', 'DONE', _app);
				    	return;
					}));
				}catch(error){
					console.log("Exception Thrown", error);
					AppDeployLog.create({
						uid: _app.uid,
						app: _app._id,
						server: _app.server._id,
						status: 'failed',
						app_name: _app.app_name,
						deploy_type: 'auto',
						message: 'Exception: Unable to deploy'
					}).then((res)=>{
						console.log("deployLogs created");
					}).catch((err)=>{
						console.log("deployLogError", err);
					});
					return;
				}
			}
			// }else{
			// 	//Deactivated from github? set auto_deploy: false
			// 	UserApp.updateOne(_app, Object.assign({}, _app, {auto_deploy: false }))
			// 		.then((res)=>{
			// 		console.log("Unregistering github autodeploy success", res);
			// 	}).catch((err)=>{
			// 		console.log("Unregistering github autodeploy failed", err);
			// 	});
			// }
		}).catch((error)=>{
			console.log("Github webhooks Issue: App Not Found");
			console.log("FATAL ERROR", error);
		    return;
		});
		
	});
};