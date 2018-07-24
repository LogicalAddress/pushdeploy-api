var laeh = require('laeh2').leanStacks(true), _x = laeh._x,
AppConfig = require('../../config/app'),
sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
// fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function(req, _server){
	console.log("serverLogs.js","ORIGINAL REQ", req.body);
	try{
		opts.host = _server.ipv4;
		opts.username = _server.superuser || 'ubuntu';
		if(_server.provider === "custom"){
			opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
		}else if(_server.provider === "aws"){
			opts.privateKey = _server.private_key;
		}else{
			throw new Error("Invalid Server Provider. How did we get here?");
		}
		// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
		opts.session = [
	        { op: 'exec', command: 'export SERVER_ID='+_server._id+' CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/server/events ACTION=server_logs && /home/'+_server.superuser+'/_setup.sh > _query.log.out 2>&1' },
	    ];
	    console.log("calling sshclient");
		sshclient.session(opts, _x(function(err, response){
			//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
			console.log("remote server error", err);
		}, true, function(err, data) {
			// Control reaches here when cargoshell returns a zero EXIT_STATUS
			console.log(err);
		    console.log('CREATE_APP', 'DONE');
		}));
	}catch(error){
		console.log("Exception Thrown", error);
	}
};