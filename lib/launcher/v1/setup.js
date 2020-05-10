var laeh = require('laeh2').leanStacks(true), _x = laeh._x,
AppConfig = require('../../../config/app'),
sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
rollback = require("../rollback"),
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

var copts = {
	example_repo: "https://github.com/LogicalAddress/pushdeploy-nodejs-example.git",
	node_version: "8.9.3",
	entry_point: "bin/www"
};

module.exports = function(req, _server, redo){
	try{
		opts.host = req.body.ipv4;
		opts.username = req.body.username || 'ubuntu';
		if(_server.provider === "custom"){
			opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
		}else if(_server.provider === "aws"){
			opts.privateKey = _server.private_key;
		}else if(_server.provider === "linode"){
			opts.privateKey = _server.private_key;
		}else{
			throw new Error("Invalid Server Provider. How did we get here?");
		}
		// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');

		if(opts.username == 'root'){
			opts.session = [
		        { op: 'writeFile', path: '/'+opts.username+'/.setup.sh', body: fs.readFileSync(__dirname + '/../../../cargoshell/cargoshell_ubuntu_16.04.sh') },
		        { op: 'exec', command: 'chmod +x /'+opts.username+'/.setup.sh' },
		        { op: 'exec', command: 'export USERCARGOSPACEPUBKEY="' + req.techpool.credentials.custom_public_key + '" SERVER_ID='+_server._id+' CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/server/events ACTION=init_with_default_app SERVER_ENTRY_POINT='+copts.entry_point+' APP_NAME=default PORT=3000 NODE_VERSION='+copts.node_version+' REPOSITORY="'+copts.example_repo+'" && /'+opts.username+'/.setup.sh > .log.out 2>&1' },
		    ];
		}else{	
			opts.session = [
		        { op: 'writeFile', path: '/home/'+opts.username+'/.setup.sh', body: fs.readFileSync(__dirname + '/../../../cargoshell/cargoshell_ubuntu_16.04.sh') },
		        { op: 'exec', command: 'chmod +x /home/'+opts.username+'/.setup.sh' },
		        { op: 'exec', command: 'export SERVER_ID='+_server._id+' CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/server/events ACTION=init_with_default_app SERVER_ENTRY_POINT='+copts.entry_point+' APP_NAME=default PORT=3000 NODE_VERSION='+copts.node_version+' REPOSITORY="'+copts.example_repo+'" && /home/'+opts.username+'/.setup.sh > .log.out 2>&1' },
		    ];
	    }
		sshclient.session(opts, _x(function(err, response){
			//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
			console.log("Authentication Problems", err, response);
			if(err && !redo){
				rollback(req, _server);
			}
		}, true, function(err, data) {
			// Control reaches here when cargoshell returns a zero EXIT_STATUS
			if(err && !redo){
				rollback(req, _server);
				return;
			}
			try{
				req.io.to(_server.uid).emit('CREATE_SERVER_SUCCESS', _server);
			}catch(err){
				console.log("socket.io failed", err.message);
			}
		    console.log('CREATE_INSTANCE', 'DONE');
		}));
	}catch(error){
		console.log("Exception Thrown", error);
		if(!redo){
			rollback(req, _server);
		}
	}
};