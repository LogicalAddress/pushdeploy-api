var Auth = require("../../../lib/middlewares/authenticate"), 
laeh = require('laeh2').leanStacks(true), _x = laeh._x,
sshclient = require("sshclient"),
UserApp = require('../../../lib/launcher/UserApps'), 
Cred = require("../../../lib/middlewares/credentials"),
// AppConfig = require('../../../config/app'),
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function (app, socketIO) {
	
	app.post('/v1/app/artisan', Auth, Cred, (req, res, next) => {
		UserApp.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.app_id
		}).then((response)=>{
			var _app = response;
			if(response){
				try{
					console.log("Runnign Aritsan Command ..", _app);
					opts.host = _app.server.ipv4;
					opts.username = _app.server.superuser || 'ubuntu';
					// opts.privateKey = req.techpool.credentials.custom_private_key;
					// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
					if(_app.server.provider === "custom"){
						opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: use server.private_key
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
						{ op: 'exec', command: 'export COMMAND="'+ req.body.command +'" ACTION=laravel_cli APP_NAME='+_app.app_name+' && /home/'+_app.server.superuser+'/.setup.sh >.app_'+_app.app_name+'.log.out 2>&1' },
                    ];
                    // canFail.canFail = true;
					sshclient.session(opts, _x(function(err, response){
						//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
						console.log("Authentication Problems probably", err, response);
						if(err){
                            console.log(err, _app);
							res.status(500).json({body: { status: "failure", message: "Server issues: Unable to run artisan commands" }});
							return;
						}
					}, true, function(err, data) {
						// Control reaches here when cargoshell returns a zero EXIT_STATUS
						if(err){
							console.log(err, _app.server);
							res.status(500).json({body: { status: "failure", message: "Unable to run artisan commands" }});
							return;
						}
						res.status(200).json({body: { status: "success", data: app }});
					    console.log('ARTISAN', 'DONE', _app);
					    return;
					}));
				}catch(error){
					console.log("Exception Thrown", error);
					res.status(500).json({body: { status: "failure", message: "Unable to run artisan commands" }});
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