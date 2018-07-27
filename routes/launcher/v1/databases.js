var Auth = require("../../../lib/middlewares/authenticate"), 
Database = require('../../../lib/launcher/UserDatabases'), 
Cred = require("../../../lib/middlewares/credentials"),
Servers = require("../../../lib/launcher/UserServers"),
notifier = require("../../../lib/launcher/notifier"),
setup = require("../../../lib/launcher/v1/databaseSetup");

module.exports = function (app) {
	
	app.post('/v1/database/create', Auth, Cred, (req, res, next) => {
		Servers.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body.server
		}).then((response)=>{
			var _server = response;
			if(!_server){
				res.status(400).json({status: 'failure', message: 'bad request'});
				return;
			}
			Database.findOne({
				uid: req.techpool.user.uid, 
				server: req.body.server,
				app_name: req.body.app_name.trim(), 
			}).then((response)=>{
				if(!response){
		            Database.create({
		            	uid: req.techpool.user.uid,
		            	server: req.body.server,
		            	db_name: req.body.app_name.trim(),
		            	username: req.body.username.trim(),
		            	password: req.techpool.credentials.db_root_password,
		            }).then((database)=>{
		            	res.status(200).json({body: { status: "IN_PROGRESS", data: database }});
		            	notifier({
		            		uid: req.techpool.user.uid,
		            		data:{
						    	ACTION: "CREATE_DATABASE",
						    	O_REQ: req.body,
						    	RESPONSE: database
		            		}
		            	});
		            	setup(req, _server, database);
						return;
		            }).catch((err)=>{
		            	console.log("CREATE DATABASE ERR", err);
		            	return;
		            });
				}else{
					res.status(400).json({status: "failure", message: "Database already exists"});
					return;
				}
			}).catch((error)=>{
				console.log("GET DATABASE ERR", error);
				return;
			});
		}).catch((error)=>{
		    return res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		});	
		
	});
};