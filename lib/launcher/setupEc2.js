var laeh = require('laeh2').leanStacks(true), _x = laeh._x,
AppConfig = require('../../config/app'),
sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
fs = require("fs"),
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

module.exports = function(_server){
	return new Promise(function(resolve, reject) {
		// try{
			console.log("Sshclient is runnning");
			opts.host = _server.ipv4;
			opts.username = 'ubuntu';
			opts.privateKey = _server.private_key;
			opts.session = [
		        { op: 'writeFile', path: '/home/'+opts.username+'/_setup.sh', body: fs.readFileSync(__dirname + '/../../cargoshell/cargoshell_ubuntu_16.04.sh') },
		        { op: 'exec', command: 'chmod +x /home/'+opts.username+'/_setup.sh' },
		        { op: 'exec', command: 'export SERVER_ID='+_server._id+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/events ACTION=init_with_default_app SERVER_ENTRY_POINT='+copts.entry_point+' APP_NAME=default PORT=3000 NODE_VERSION='+copts.node_version+' REPOSITORY="'+copts.example_repo+'" && /home/'+opts.username+'/_setup.sh > log.out 2>&1' },
		    ];
		    console.log("ssh connection params", opts);
			sshclient.session(opts, _x(function(err){
				//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
				console.log("Authentication Problems probably", err);
				reject(err);
			}, true, function(err, data) {
				// Control reaches here when cargoshell returns a zero EXIT_STATUS
				if(err){
					reject(err);
					return;
				}
			    console.log('CREATE_INSTANCE', 'DONE');
			    resolve(true);
			    return;
			}));
		// }catch(error){
			// console.log("Exception Thrown", error);
			// reject(error);
		// }
	});
};