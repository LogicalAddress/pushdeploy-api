var Auth = require("../../../lib/middlewares/authenticate"), 
App = require('../../../lib/launcher/UserApps'), 
Cred = require("../../../lib/middlewares/credentials"),
refreshToken = require("../../../lib/middlewares/bitbucketRtoken"),
Servers = require("../../../lib/launcher/UserServers"),
setup = require("../../../lib/launcher/v1/appSetup"),
notifier = require("../../../lib/launcher/notifier"),
laeh = require('laeh2').leanStacks(true), _x = laeh._x,
sshclient = require("sshclient"),
AppConfig = require('../../../config/app'),
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function (app, socketIO) {


	app.get('/v1/apps', Auth, function (req, res, next) {
		App.findAllBy({uid: req.techpool.user.uid}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});


	app.get('/v1/apps/:id', Auth, function (req, res, next) {
		App.findOne({uid: req.techpool.user.uid, _id: req.params.id}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});

	app.delete('/v1/apps/:id', Auth, Cred, function (req, res, next) {
		App.updateOne({uid: req.techpool.user.uid, _id: req.params.id}, {lock: true}).then((_app)=>{
			try{
				opts.host = _app.server.ipv4;
				opts.username = _app.server.superuser || 'ubuntu';
				if(_app.server.provider === "custom"){
					opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
				}else if(_app.server.provider === "aws"){
					opts.privateKey = _app.server.private_key;
				}else if(_app.server.provider === "linode"){
					opts.privateKey = _app.server.private_key;
				}else{
					throw new Error("Invalid Server Provider. How did we get here?");
				}
				opts.session = [
					{ op: 'writeFile', path: '/home/'+opts.username+'/.setup.sh', body: fs.readFileSync(__dirname + '/../../../cargoshell/cargoshell_ubuntu_16.04.sh') },
					{ op: 'exec', command: 'chmod +x /home/'+opts.username+'/.setup.sh' },
					{ op: 'exec', command: 'export CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/server/events ACTION=delete_app APP_NAME='+_app.app_name+' APP_ID='+_app._id+' TEMPLATE='+_app.template + ' && /home/'+_app.server.superuser+'/.setup.sh >.app_'+_app.app_name+'.log.out 2>&1' },
			    ];
				sshclient.session(opts, _x(async function(err, response){
					//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
					console.log("Authentication Problems probably", err, response);
					if(err){
						console.log(err, _app);
						await App.updateOne({uid: req.techpool.user.uid, _id: req.params.id}, {lock: false});
						res.status(400).json({status: "failure", message: "Authentication problems"});
						return;
					}
				}, true, async function(err, data) {
					// Control reaches here when cargoshell returns a zero EXIT_STATUS
					if(err){
						console.log(err, _app.server);
						await App.updateOne({uid: req.techpool.user.uid, _id: req.params.id}, {lock: false});
						res.status(400).json({status: "failure", message: "Unable to delete app"});
						return;
					}
					console.log('DELETE APP', 'DONE', _app);
					await App.delete(_app);
					res.status(200).json({body: { status: "success"}});
				}));
			}catch(error){
				console.log("Exception Thrown", error);
				return;
			}
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error.message});
		});			
	});
	
	app.post('/v1/app/create', Auth, refreshToken, Cred, (req, res, next) => {
		req.io = socketIO;
		Servers.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body.server
		}).then((response)=>{
			var _server = response;
			if(!_server){
				res.status(400).json({status: 'failure', message: 'bad request'});
				return;
			}
			App.findOne({
				uid: _server.uid, 
				server: req.body.server,
				/*differ multiple app different template to v10 if we ever get there*/
				app_name: req.body.app_name.trim(), 
			}).then((response)=>{
				var _app = response;
				if(!response){
					/* Future Notification
					In v10, only allow App.create when current template, and 
					template_variation differ for what it's already there
					*/
		            App.create({
		            	uid: _server.uid,
		            	server: req.body.server,
		            	app_name: req.body.app_name.trim(),
		            	app_repository: req.body.clone_url || req.body.app_repository.trim(),
		            	template: req.body.template,
		            	template_variation: req.body.template_variation,
		            	isPublic: req.body.repo_meta_data.isPublic,
		            	git_provider: req.body.git_provider || "",
		            	repo_id: req.body.repo_id,
		            	repo_node_id: req.body.repo_node_id,
		            	repo_full_name: req.body.repo_full_name,
		            	repo_name: req.body.repo_name,
		            }).then((app)=>{
		            	_app = app;
		            	res.status(200).json({body: { status: "IN_PROGRESS", data: app }});
		            	notifier({
		            		uid: _app.uid,
		            		data:{
						    	ACTION: "CREATE_APP",
						    	O_REQ: req.body,
								DATA: app,
		            		}
		            	});
		            	console.log("calling appSetup");
		            	setup(req, _server, _app);
						return;
		            }).catch((err)=>{
		            	console.log("CREATE APP ERR", err);
		            	return;
		            });
				}else{
					_app.state = 'RE-INITIALIZING'; //ignore db update. Is it important?
					res.status(200).json({body: { status: "IN_PROGRESS", data: _app }});
					setup(req, _server, _app);
					return;
				}
			}).catch((error)=>{
				console.log("GET APP ERR", error);
				return;
			});
		}).catch((error)=>{
		    return res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		});	
		
	});
};