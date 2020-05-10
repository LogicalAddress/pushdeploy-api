var laeh = require('laeh2').leanStacks(true), _x = laeh._x,
AppConfig = require('../../../config/app'),
sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
rollback = require("../databaseRollback"),
fs = require("fs"),
opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function(req, _server, database){
	console.log("databaseSetup.js","ORIGINAL REQ", req.body);
	try{
		opts.host = _server.ipv4;
		opts.username = _server.superuser || 'ubuntu';
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
		console.log(opts.privateKey);
		opts.session = [
			{ op: 'writeFile', path: '/home/'+opts.username+'/.setup.sh', body: fs.readFileSync(__dirname + '/../../../cargoshell/cargoshell_ubuntu_16.04.sh') },
	        { op: 'exec', command: 'chmod +x /home/'+opts.username+'/.setup.sh' },
	        { op: 'exec', command: 'export DB_ID='+database._id+' SERVER_ID='+_server._id+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/events ACTION=add_'+database.db_type+'_database DB_ROOT_PASSWORD='+req.techpool.credentials.db_root_password+' DB_USERNAME='+database.username+' DB_PASSWORD='+database.password+' DB_NAME='+database.db_name+' && /home/'+_server.superuser+'/.setup.sh > .log.out 2>&1' },
	    ];
	    console.log("calling sshclient");
		sshclient.session(opts, _x(function(err, response){
			//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
			console.log("remote server error", err);
			if(err){
				rollback(req, database);
			}
		}, true, function(err, data) {
			// Control reaches here when cargoshell returns a zero EXIT_STATUS
			console.log(err);
			if(err){
				rollback(req, database);
				return;
			}
		    console.log('CREATE_DATABASE', 'DONE');
		}));
	}catch(error){
		console.log("Exception Thrown in databaseSetup.js", error);
		rollback(req, database);
	}
};