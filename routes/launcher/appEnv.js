var Auth = require("../../lib/middlewares/authenticate"), 
laeh = require('laeh2').leanStacks(true), _x = laeh._x,
sshclient = require("sshclient"),
UserApp = require('../../lib/launcher/UserApps'), 
Cred = require("../../lib/middlewares/credentials"),
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function (app) {
	
	app.post('/v1/app/env', Auth, Cred, (req, res, next) => {
		UserApp.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.app_id
		}).then((response)=>{
			var _app = response;
			if(response){
				try{
					opts.host = _app.server.ipv4;
					opts.username = _app.server.username || 'ubuntu';
					// opts.privateKey = req.techpool.credentials.custom_private_key;
					opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
					var remoteFile = '/home/'+opts.username+'/.cargospace/'+_app.app_name+'.sh';
					console.log("Remote file to get", remoteFile);
					opts.session = [
				        { op: 'writeFile', path: remoteFile, body: req.body.app_shell_script },
				        { op: 'exec', command: 'chmod +x '+remoteFile },
				    ];
					sshclient.session(opts, _x(function(err, response){
						//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
						console.log("Authentication Problems probably", err, response);
						if(err){
							console.log(err, _app);
							res.status(500).json({body: { status: "failure", message: "Server issues: Unable to save env" }});
							return;
						}
					}, true, function(err, data) {
						// Control reaches here when cargoshell returns a zero EXIT_STATUS
						if(err){
							console.log(err, _app.server);
							res.status(500).json({body: { status: "failure", message: "Unable to save env" }});
							return;
						}
						_app.app_shell_script = req.body.app_shell_script;
						_app.save().then((app)=>{
							res.status(200).json({body: { status: "success", data: app }});
							return;
						}).catch((error)=>{
							res.status(500).json({body: { status: "failure", message: "Unable to save env" }});
							return;
						});
					    console.log('WRITE_ENV', 'DONE', _app);
					}));
				}catch(error){
					console.log("Exception Thrown", error);
					res.status(500).json({body: { status: "failure", message: "Unable to deploy" }});
					return;
				}
			}else{
				console.log("App not found", response);
				res.status(400).json({status: 'failure', message: 'App not found'});
				return;
			}
		}).catch((error)=>{
			console.log("FATAL ERROR", error);
		    res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		    return;
		});	
		
	});
};