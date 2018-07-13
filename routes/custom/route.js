var Auth = require("../../lib/middlewares/authenticate")
, App = require('../../lib/launcher/UserApps')
, Cred = require("../../lib/middlewares/credentials")
, fs = require("fs") , laeh = require('laeh2').leanStacks(true), _x = laeh._x
, sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
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
		Servers.findOne({uid: req.techpool.user.uid, ipv4: req.body.ipv4}).then((response)=>{
			var _server = response, _app = {};
			if(!response){
				Servers.create({
		            uid: req.techpool.user.uid,
		            server_name: generate({ number: true }).dashed, // 'disgraceful-temper-7794'
		            ipv4: req.body.ipv4,
		            provider: 'custom',
		            meta: JSON.stringify(req.body)
		        }).then(function(response){
		        	_server = response;
		            res.status(200).json({body: { status: "IN_PROGRESS", data: response }});
		            App.create({
		            	uid: req.techpool.user.uid,
		            	server: response._id,
		            	app_name: 'default',
		            	app_repository: copts.example_repo,
		            	template: 'nodejs',
		            	template_variation: copts.node_version,
		            }).then((app)=>{
		            	_app = app;
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
		    	}).catch(function(err) {
		    	    console.log("DEBUG", err);
		    	    return res.status(400).json({status: 'failure', message: err});
		    	});
			}else{
				_server.state = 'RE-INITIALIZING';
				res.status(200).json({body: { status: "IN_PROGRESS", data: response }});
			}
	    	opts.host = req.body.ipv4;
			opts.username = req.body.username || 'ubuntu';
			// opts.privateKey = req.techpool.credentials.custom_private_key;
			opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
			opts.session = [
		        { op: 'writeFile', path: '/home/'+opts.username+'/_setup.sh', body: fs.readFileSync(__dirname + '/../../cargoshell/cargoshell_ubuntu_16.04.sh') },
		        { op: 'exec', command: 'chmod +x /home/'+opts.username+'/_setup.sh' },
		        { op: 'exec', command: 'export ACTION=init_with_default_app SERVER_ENTRY_POINT='+copts.entry_point+' APP_NAME=default PORT=3000 NODE_VERSION='+copts.node_version+' REPOSITORY="'+copts.example_repo+'" && /home/'+opts.username+'/_setup.sh > log.out 2>&1' },
		    ];
			sshclient.session(opts, _x(function(err, response){
				//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
				if(!err) return;
				//TODO: Use Event Emitter
				App.deleteServerApps(_server).then((response)=>{
					console.log("DEL APPS", response.result);
				}).catch((err)=>{
					console.log("DEL APPS", err);
				});
				Servers.deleteServer(_server).then((response)=>{
					console.log("DEL SERVER", response.result);
				}).catch((err)=>{
					console.log("DEL SERVER", err);
				});
				AppCounter.deleteServer(_server).then((response)=>{
					console.log("DEL APPCOUNTER", response.result);
				}).catch((err)=>{
					console.log("DEL APPCOUNTER", err);
				});
				notifier({
			    	data: {
				    	ACTION: "CREATE_APP",
				    	O_REQ: req.body,
				    	RESPONSE: "rollback",
				    	O_RES: _app
			    	}
			    });
				notifier({
			    	data: {
				    	ACTION: "CREATE_INSTANCE",
				    	O_REQ: req.body,
				    	RESPONSE: "rollback",
				    	O_RES: _server
			    	}
			    });
			}, true, function(err, data) {
				// Control reaches here when cargoshell returns a zero EXIT_STATUS
				if(err){
					//TODO: Use Event Emitter
					App.deleteServerApps(_server).then((response)=>{
					console.log("DEL APPS", response.result);
					}).catch((err)=>{
						console.log("DEL APPS", err);
					});
					Servers.deleteServer(_server).then((response)=>{
						console.log("DEL SERVER", response.result);
					}).catch((err)=>{
						console.log("DEL SERVER", err);
					});
					AppCounter.deleteServer(_server).then((response)=>{
						console.log("DEL APPCOUNTER", response.result);
					}).catch((err)=>{
						console.log("DEL APPCOUNTER", err);
					});
					notifier({
				    	data: {
					    	ACTION: "CREATE_APP",
					    	O_REQ: req.body,
					    	RESPONSE: "rollback",
					    	O_RES: _app
				    	}
				    });
					notifier({
				    	data: {
					    	ACTION: "CREATE_INSTANCE",
					    	O_REQ: req.body,
					    	RESPONSE: "rollback",
					    	O_RES: _server
				    	}
				    });
					return;
				}
			    console.log('CREATE_INSTANCE', 'DONE');
			    _server.state = 'RUNNING';
			    _server.save().then((response)=>{
			    	console.log("UPDATE_SERVER", response);
			    	notifier({
				    	data: {
					    	ACTION: "UPDATE_SERVER",
					    	O_REQ: req.body,
					    	RESPONSE: response
				    	}
			    	});
			    }).catch((err)=>{
			    	console.log("UPDATE_SERVER", err);
			    });
			    notifier({
			    	data: {
				    	ACTION: "CREATE_INSTANCE",
				    	O_REQ: req.body,
				    	RESPONSE: "ready"
			    	}
			    });
			}));
		}).catch((error)=>{
		    return res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		});	
		
	});
};