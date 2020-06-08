var Auth = require("../../../lib/middlewares/authenticate"), 
laeh = require('laeh2').leanStacks(true), _x = laeh._x,
sshclient = require("sshclient"),
UserApp = require('../../../lib/launcher/UserApps'), 
Cred = require("../../../lib/middlewares/credentials"),
AppConfig = require('../../../config/app'),
fs = require("fs"),
 opts = {
    port: 22,
    debug: true,
    console: console,
    session: [],
},
multer  = require('multer'),
storage = multer.memoryStorage(),
upload = multer({ storage: storage });;


module.exports = function (app, io) {
	
	app.post('/v1/app/dotEnv', Auth, Cred, (req, res, next) => {
		UserApp.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body._id || req.body.app_id
		}).then((response)=>{
			var _app = response;
			if(response){
				try{
					opts.host = _app.server.ipv4;
					opts.username = _app.server.superuser || 'ubuntu';
					// opts.privateKey = req.techpool.credentials.custom_private_key;
					// opts.privateKey = fs.readFileSync(__dirname + '/../../launcher.pem');
					if(_app.server.provider === "custom"){
						opts.privateKey = req.techpool.credentials.custom_private_key;//TODO: Copy to _server during setup for custom
					}else if(_app.server.provider === "aws"){
						opts.privateKey = _app.server.private_key;
					}else if(_app.server.provider === "linode"){
						opts.privateKey = _app.server.private_key;
					}else{
						throw new Error("Invalid Server Provider. How did we get here?");
					}
					var remoteFile = '/home/'+opts.username+'/'+_app.app_name+'/.env';
					console.log("Remote file to update", remoteFile);
					opts.session = [
				        { op: 'writeFile', path: remoteFile, body: req.body.env },
				        { op: 'exec', command: 'chmod 777 '+remoteFile },
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


    app.post('/v1/dotEnv/event', Auth, Cred, upload.single('dotEnv'), function (req, res, next) {
        res.status(200).send("ok");
        try{
            io.to(req.techpool.user.uid).emit('APP_DOT_ENV', req.file.buffer.toString('utf-8'));
        }catch(error){
            console.log("Exception Thrown", error);
        }
    });
    

    app.get('/v1/dotEnv/:app_id', Auth, Cred, (req, res, next) => {
		UserApp.findOne({
			uid: req.techpool.user.uid, 
			_id: req.params.app_id
		}).then((response)=>{
            var _app = response;
			if(response){
                if(_app.template !== 'laravel'){
                    res.status(200).json({body: { status: "success", data: _app }});
                    return;
                }
				try{
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
                        { op: 'exec', command: 'export ACTION=get_dot_env APP_ID='+ _app._id+' APP_NAME='+_app.app_name+' CALLBACK_TOKEN='+req.techpool.user.access_token+' CALLBACK_URL='+AppConfig.AppDomain+'/v1/dotEnv/event && /home/'+_app.server.superuser+'/.setup.sh > .log.out 2>&1' },
                    ];
                    // canFail.canFail = true;
					sshclient.session(opts, _x(function(err, response){
						//Control Only reaches here when cargoshell returns with a non-zero EXIT_STATUS
						console.log("Authentication Problems probably", err, response);
						if(err){
                            console.log(err, _app);
							res.status(500).json({body: { status: "failure", message: "Server issues: Unable to get DotENV" }});
							return;
						}
					}, true, function(err, data) {
						// Control reaches here when cargoshell returns a zero EXIT_STATUS
						if(err){
							console.log(err, _app.server);
							res.status(500).json({body: { status: "failure", message: "Unable to get DotENV" }});
							return;
						}
						res.status(200).json({body: { status: "success", data: _app }});
					    console.log('DOTENV', 'DONE', _app);
					    return;
					}));
				}catch(error){
					console.log("Exception Thrown", error);
					res.status(500).json({body: { status: "failure", message: "Unable to get DotENV" }});
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