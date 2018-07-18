var Auth = require("../../lib/middlewares/authenticate"), 
App = require('../../lib/launcher/UserApps'), 
Cred = require("../../lib/middlewares/credentials"),
refreshToken = require("../../lib/middlewares/bitbucketRtoken"),
Servers = require("../../lib/launcher/UserServers"),
setup = require("../../lib/launcher/appSetup"),
notifier = require("../../lib/launcher/notifier");

module.exports = function (app) {
	
	app.post('/v1/app/create', Auth, refreshToken, Cred, (req, res, next) => {
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
				uid: req.techpool.user.uid, 
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
		            	uid: req.techpool.user.uid,
		            	server: req.body.server,
		            	app_name: req.body.app_name.trim(),
		            	app_repository: req.body.app_repository.trim(),
		            	template: req.body.template,
		            	template_variation: req.body.template_variation,
		            	isPublic: req.body.repo_meta_data.isPublic,
		            	git_provider: req.body.git_provider || ""
		            }).then((app)=>{
		            	_app = app;
		            	res.status(200).json({body: { status: "IN_PROGRESS", data: app }});
		            	notifier({
		            		uid: req.techpool.user.uid,
		            		data:{
						    	ACTION: "CREATE_APP",
						    	O_REQ: req.body,
						    	RESPONSE: app
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