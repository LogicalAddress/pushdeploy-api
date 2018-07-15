var Auth = require("../../lib/middlewares/authenticate"), 
UserApp = require('../../lib/launcher/UserApps'), 
Cred = require("../../lib/middlewares/credentials"),
UserServer = require("../../lib/launcher/UserServers"),
generate = require('project-name-generator'),
setup = require("../../lib/launcher/setup"),
notifier = require("../../lib/launcher/notifier");

var copts = {
	example_repo: "https://github.com/shapeshed/express_example.git",
	node_version: "8.9.3",
	entry_point: "bin/www"
};

module.exports = function (app) {
	
	app.post('/v1/custom/instances', Auth, Cred, (req, res, next) => {
		UserServer.findOne({
			uid: req.techpool.user.uid, 
			ipv4: req.body.ipv4
		}).then((response)=>{
			var _server = response;
			if(!response){
				UserServer.create({
		            uid: req.techpool.user.uid,
		            server_name: generate({ number: true }).dashed, // 'disgraceful-temper-7794'
		            ipv4: req.body.ipv4,
		            provider: 'custom',
		            meta: JSON.stringify(req.body)
		        }).then(function(_server){
		            UserApp.create({
		            	uid: req.techpool.user.uid,
		            	server: _server._id,
		            	app_name: 'default',
		            	app_repository: copts.example_repo,
		            	template: 'nodejs',
		            	template_variation: copts.node_version,
		            }).then((app)=>{
		            	console.log("app created", app);
		            	UserServer.findOne({_id: _server._id})
		            	.then((_server)=>{
		            		res.status(200).json({body: { status: "IN_PROGRESS", data: _server }});
		            		notifier({
			            		data:{
							    	ACTION: "CREATE_INSTANCE",
							    	O_REQ: req.body,
							    	MESSAGE: "INITIALIZING"
			            		}
			            	});
		            	}).catch((err)=>{
		            		console.log("User Server FindOne", err);
		            	});
		            	setup(req, _server);
		            	return;
		            }).catch((err)=>{
		            	console.log("APP create", err);
		            	return;
		            });
		    	}).catch(function(err) {
		    	    console.log("CREATE SERVER ERR", err);
		    	    return res.status(400).json({status: 'failure', message: err});
		    	});
			}else{
				_server.state = 'RE-INITIALIZING'; //ignore db update. Is it important?
				res.status(200).json({body: { status: "IN_PROGRESS", data: response }});
				setup(req, _server, true);
				return;
			}
		}).catch((error)=>{
			console.log("FATAL ERROR", error);
		    return res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		});	
		
	});
};