var Auth = require("../../../lib/middlewares/authenticate"), 
Database = require('../../../lib/launcher/UserDatabase'), 
Cred = require("../../../lib/middlewares/credentials"),
Servers = require("../../../lib/launcher/UserServers"),
notifier = require("../../../lib/launcher/notifier"),
// generate = require('project-name-generator'),
setup = require("../../../lib/launcher/v1/databaseSetup");
var hat = require('hat');
module.exports = function (app, socketIO) {
	
	app.get('/v1/database/:server_id', Auth, function (req, res, next) {
		Database.findAll({
			uid: req.techpool.user.uid,
			server: req.params.server_id
		}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
			console.log("Database 404", {
				uid: req.techpool.user.uid,
				server: req.params.server_id
			}, error);
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
	
	app.post('/v1/database', Auth, Cred, (req, res, next) => {
		//{"db_type":"mysql","server":"5b540c5d5322f41be1055951"}
		Servers.findOne({
			uid: req.techpool.user.uid, 
			_id: req.body.server
		}).then((response)=>{
			var _server = response;
			if(!_server){
				res.status(400).json({status: 'failure', message: 'bad request'});
				return;
			}
            Database.create({
            	uid: req.techpool.user.uid,
            	server: req.body.server,
            	db_name: hat().substring(0, 6), //generate({ words: 1 }).raw[0].toLowerCase(),
            	username: hat().substring(0, 6), //generate({ words: 1 }).raw[0].toLowerCase(),
            	password: hat(),
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
		}).catch((error)=>{
			console.log("Server 404", {
				uid: req.techpool.user.uid, 
				_id: req.body.server
			}, error);
		    return res.status(500).json({status: 'failure', message: 'unexpected error occurred'});
		});	
		
	});
};