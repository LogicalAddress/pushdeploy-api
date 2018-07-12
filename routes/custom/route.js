var Auth = require("../../lib/middlewares/authenticate")
, Cred = require("../../lib/middlewares/credentials")
, fs = require("fs") , laeh = require('laeh2').leanStacks(true), _x = laeh._x
, sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
 Servers = require("../../lib/launcher/UserServers"),
 generate = require('project-name-generator'), request = require("request"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
};

var cb = function(err, response){
	if(err) return console.log(err);
	if(!response.webhook) return;
	request.post({
    	url: response.webhook,
    	headers: {
    		'Accept': 'application/json', 
    	},
    	json: response.data,
    },
    (error, response, body) => {
    	console.log("Webhook Response", body);
    });
}

module.exports = function (app) {
	
	app.post('/v1/custom/instances', Auth, Cred, (req, res, next) => {
		Servers.findOne({uid: req.techpool.user.uid, ipv4: req.body.ipv4}).then((record)=>{
			if(record) return res.status(400).json({status: 'failure', message: 'bad request'});//script supports retries though
			Servers.create({
	            uid: req.techpool.user.uid,
	            server_name: generate({ number: true }).dashed, // 'disgraceful-temper-7794'
	            ipv4: req.body.ipv4,
	            provider: 'custom',
	            meta: JSON.stringify(req.body)
	        }).then(function(response){
	            res.status(200).json({body: { status: "IN_PROGRESS", data: response }});
	    	}).catch(function(err) {
	    	    console.log("DEBUG", err);
	    	    return res.status(400).json({status: 'failure', message: err});
	    	});
	    	opts.host = req.body.ipv4;
			opts.username = req.body.username || 'ubuntu';
			opts.privateKey = req.techpool.credentials.custom_private_key;
			opts.session = [
		        { op: 'writeFile', path: '/home/ubuntu/setup.sh', body: fs.readFileSync(__dirname + '/../../cargoshell/cargoshell_ubuntu_16.04.sh') },
		        { op: 'exec', command: 'chmod +x /home/ubuntu/setup.sh' },
		        { op: 'exec', command: 'export ACTION=init_with_default_app SERVER_ENTRY_POINT=app.js APP_NAME=default PORT=8080 NODE_VERSION=8.9.3 REPOSITORY="https://github.com/shapeshed/express_example.git" && /home/ubuntu/setup.sh > log.out 2>&1' },
		    ]
			console.log("REMOTE SSH PARAMS", opts);
			sshclient.session(opts, _x(cb, true, function(err, data) {
			    console.log('CREATE_INSTANCE...DONE');
			    cb(req.body.webhook, {
			    	ACTION: "CREATE_INSTANCE",
			    	LOG: "",
			    	O_REQ: req.body,
			    	REPSONSE: "ready"
			    });
			}));
		}).catch((error)=>{
		    return res.status(500).json({status: 'failure', message: 'unexpected error occur'});
		});	
		
	});
};