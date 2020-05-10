var Auth = require("../../../lib/middlewares/authenticate"), 
UserApps = require('../../../lib/launcher/UserApps'), 
Cred = require("../../../lib/middlewares/credentials"),
fs = require("fs"),
Client = require('ssh2').Client,
opts = {
    port: 22,
    debug: true,
    console: console,
};

module.exports = function (app, socketIO) {
	
	app.post('/v1/app/deployLogs', Auth, Cred, (req, res, next) => {

		UserApps.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.app_id,
		}).then((response)=>{
			var _app = response;
			if(response){
				try{
					var conn = new Client(), _server = _app.server;
					opts.host = _app.server.ipv4;
					opts.username = _app.server.superuser || 'ubuntu';
					if(_server.provider === "custom"){
						opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
					}else if(_server.provider === "aws"){
						opts.privateKey = _server.private_key;
					}else if(_server.provider === "linode"){
						opts.privateKey = _server.private_key;
					}else{
						throw new Error("Invalid Server Provider. How did we get here?");
					}
					var logBuf = "", count = 0;
					conn.on('ready', function() {
					    conn.shell(function(err, stream) {
					        if (err) {
					        	console.log('RETRIEVE APP_LOGS ERR '+_app.app_name+' STDERR: ', err);
					            res.status(400).json({body: { status: "failure", message: err }});
					        	return;
					        }
					        stream.on('close', function() {
					            console.log('RETRIEVE APP_LOGS '+_app.app_name+'Stream :: close');
					            res.status(200).json({body: { status: "success", data: logBuf.toString('utf-8') }});
					            conn.end();
					            return;
					        }).on('data', function(data) {
					            logBuf += data.toString('utf-8');
					        }).stderr.on('data', function(data) {
					            console.log('RETRIEVE APP_LOGS '+_app.app_name+' STDERR: ', data);
					            res.status(400).json({body: { status: "failure", message: data.toString }});
					            return;
					        });
					        var logfile = /*(_app.app_name === "default" ? 'log.out' : */'.app_'+_app.app_name+'.log.out';//);
					        stream.end('tail -n 100 /home/'+_app.server.superuser+'/'+logfile+';\nexit\n');
					  });
					  
					}).connect(opts);
				}catch(error){
					console.log("Exception Thrown", error);
					res.status(500).json({body: { status: "failure", message: "Unable to get logs" }});
					return;
				}
			}else{
				console.log("App does not exists");
				res.status(400).json({body: { status: "failure", message: "App does not exists" }});
				return;
			}
		}).catch((error)=>{
			console.log("GET APP ERR", error);
			res.status(500).json({body: { status: "failure", message: "Unable to get logs" }});
			return;
		});
		
	});
};