var Auth = require("../../../lib/middlewares/authenticate"), 
UserServer = require('../../../lib/launcher/UserServers.js'), 
Cred = require("../../../lib/middlewares/credentials"),
fs = require("fs"),
Client = require('ssh2').Client,
opts = {
    port: 22,
    debug: true,
    console: console,
};

module.exports = function (app, socketIO) {
	
	app.post('/v1/server/logs', Auth, Cred, (req, res, next) => {

		UserServer.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.server_id,
		}).then((response)=>{
			var _server = response;
			if(response){
				try{
					var conn = new Client();
					opts.host = _server.ipv4;
					opts.username = _server.superuser || 'ubuntu';
					// opts.privateKey = req.techpool.credentials.custom_private_key;
					if(_server.provider === "custom"){
						opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
					}else if(_server.provider === "aws"){
						opts.privateKey = _server.private_key;
					}else{
						throw new Error("Invalid Server Provider. How did we get here?");
					}
					// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
					var logBuf = "";
					conn.on('ready', function() {
					    conn.shell(function(err, stream) {
					        if (err) {
					        	console.log('RETRIEVE SERVER_LOGS ERR '+_server.server_name+' STDERR: ', err);
					            res.status(400).json({body: { status: "failure", message: err }});
					        	return;
					        }
					        stream.on('close', function() {
					            console.log('RETRIEVE SERVER_LOGS '+_server.server_name+'Stream :: close');
					            res.status(200).json({body: { status: "success", data: logBuf.toString() }});
					            conn.end();
					            return;
					        }).on('data', function(data) {
					            logBuf += data.toString('utf-8');
					        }).stderr.on('data', function(data) {
					            console.log('RETRIEVE SERVER_LOGS '+_server.server_name+' STDERR: ', data);
					            res.status(400).json({body: { status: "failure", message: data.toString }});
					            return;
					        });
					        stream.end('tail -n 100 /home/'+_server.superuser+'/log.out;\nexit\n');
					  });
					  
					}).connect(opts);
				}catch(error){
					console.log("Exception Thrown", error);
					res.status(500).json({body: { status: "failure", message: "Unable to get logs" }});
					return;
				}
			}else{
				res.status(400).json({body: { status: "failure", message: "Server does not exists" }});
				return;
			}
		}).catch((error)=>{
			console.log("GET SERVER ERR", error);
			return;
		});
		
	});
};