var laeh = require('laeh2').leanStacks(true), _x = laeh._x,
AppConfig = require('../../config/app'),
sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
rollback = require("../../lib/launcher/appRollback"),
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

module.exports = function(req, _server, _app, redo){
	try{
		opts.host = _server.ipv4;
		opts.username = _server.superuser || 'ubuntu';
		// opts.privateKey = req.techpool.credentials.custom_private_key;
		opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
		opts.session = [
	        { op: 'exec', command: 'export SERVER_ID='+_server._id+' CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/server/events ACTION=add_app SERVER_ENTRY_POINT='+req.body.entry_point+' APP_NAME='+_app.app_name+' APP_ID='+_app._id+' PORT='+ (3000 + parseInt(_server._app_counter))+' NODE_VERSION='+_app.template_variation+' REPOSITORY="'+_app.app_repository+'" && /home/'+_server.superuser+'/_setup.sh > _app_'+_app.app_name+'.log.out 2>&1' },
	    ];
		sshclient.session(opts, _x(function(err, response){
			//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
			if(err && !redo){
				rollback(req, _app);
			}
		}, true, function(err, data) {
			// Control reaches here when cargoshell returns a zero EXIT_STATUS
			if(err && !redo){
				rollback(req, _app);
			}
		    console.log('CREATE_APP', 'DONE');
		}));
	}catch(error){
		console.log("Exception Thrown", error);
		if(!redo){
			rollback(req, _app);
		}
	}
};