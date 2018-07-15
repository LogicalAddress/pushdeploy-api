var Auth = require("../../lib/middlewares/authenticate"), 
App = require('../../lib/launcher/UserApps'), 
Cred = require("../../lib/middlewares/credentials"), fs = require("fs"),
laeh = require('laeh2').leanStacks(true), _x = laeh._x,
sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
Servers = require("../../lib/launcher/UserServers"),
generate = require('project-name-generator'), request = require("request"),
AppCounter = require('../../lib/launcher/AppCounter'),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

var copts = {
	example_repo: "https://github.com/shapeshed/express_example.git",
	node_version: "8.9.3",
	entry_point: "bin/www"
};

var notifier = function(response){
	//Webhooks or Message Broker
	request.post({
    	url: response.data.O_REQ.webhook || 'https://launcher-dretnan.c9users.io/webhooks',
    	headers: {
    		'Accept': 'application/json', 
    	},
    	json: response.data,
    },
    (error, response, body) => {
    	console.log("Webhook Response");
    });
};

module.exports = function (app) {
	
	app.post('/v1/custom/instances', Auth, Cred, (req, res, next) => {
		Servers.findOne({uid: req.techpool.user.uid, _id: req.body.server})
		.then((response)=>{
			var _server = response, _app = {};
            App.create({
            	uid: req.techpool.user.uid,
            	server: req.body.server,
            	app_name: req.body.app_name,
            	app_repository: req.body.app_repository,
            	template: req.body.template,
            	template_variation: req.body.template_variation,
            }).then((app)=>{
            	_app = app;
            	res.status(200).json({body: { status: "IN_PROGRESS", data: app }});
            	notifier({
            		data:{
				    	ACTION: "CREATE_APP",
				    	O_REQ: req.body,
				    	RESPONSE: app
            		}
            	});
            }).catch((err)=>{
            	console.log("APP", err);
            });
		    	
			// opts.privateKey = req.techpool.credentials.custom_private_key;
			opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
			opts.session = [
		        { op: 'exec', command: 'export ACTION=add_app SERVER_ENTRY_POINT='+req.body.entry_point+' APP_NAME='+_app.app_name+' PORT='+ (3000 + parseInt(_server._app_counter))+' NODE_VERSION='+_app.template_variation+' REPOSITORY="'+_app.app_repository+'" && /home/'+opts.username+'/_setup.sh > _app.log.out 2>&1' },
		    ];
			sshclient.session(opts, _x(function(err, response){
				//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
				if(!err) return;
				//TODO: Use Event Emitter
				App.delete(_app).then((response)=>{
					console.log("DEL APP", response.result);
				}).catch((err)=>{
					console.log("DEL APP ERR", err);
				});
				notifier({
			    	data: {
				    	ACTION: "CREATE_APP",
				    	O_REQ: req.body,
				    	RESPONSE: "rollback",
				    	O_RES: req.body
			    	}
			    });
			}, true, function(err, data) {
				// Control reaches here when cargoshell returns a zero EXIT_STATUS
				if(err){
					//TODO: Use Event Emitter
					App.delete(_app).then((response)=>{
						console.log("DEL APP", response.result);
					}).catch((err)=>{
						console.log("DEL APP ERR", err);
					});
					notifier({
				    	data: {
					    	ACTION: "CREATE_APP",
					    	O_REQ: req.body,
					    	RESPONSE: "rollback",
					    	O_RES: _app
				    	}
				    });
					return;
				}
			    console.log('CREATE_APP', 'DONE');
			    _app.state = 'RUNNING';
			    _app.save().then((response)=>{
			    	console.log("CREATE_APP", response);
			    	notifier({
				    	data: {
					    	ACTION: "CREATE_APP",
					    	O_REQ: req.body,
					    	RESPONSE: 'ready'
				    	}
			    	});
			    	notifier({
				    	data: {
					    	ACTION: "SERVER_UPDATE",
					    	O_REQ: req.body,
					    	RESPONSE: 'NEW APP RUNNING'
				    	}
			    	});
			    }).catch((err)=>{
			    	console.log("CREATE_APP ERR", err);
			    });
			}));
		}).catch((error)=>{
		    return res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		});	
		
	});
};