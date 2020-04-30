var Auth = require("../../../lib/middlewares/authenticate"),
Cred = require("../../../lib/middlewares/credentials"),
LogEvent = require("../../../lib/middlewares/logevent"),
UserServer = require('../../../lib/launcher/UserServers'),
UserApp = require('../../../lib/launcher/UserApps'),
UserDatabase = require('../../../lib/launcher/UserDatabase'),
notifier = require('../../../lib/launcher/notifier'),
multer  = require('multer'),
storage = multer.memoryStorage(),
upload = multer({ storage: storage });

module.exports = function (app, socketIO) {
    
	app.post('/v1/server/events', Auth, Cred, LogEvent, upload.single('file'), function (req, res, next) {
        console.log("Webhook Received: ", req.body.type);
        res.status(200).json({status: "success", message: "RECV"});
        var payload = req.body;
        if(payload.type == "CREATE_SERVER_SUCCESS"){
            UserServer.findOne({uid: req.techpool.user.uid, _id: payload.server_id})
            .then((server)=>{
                server.superuser = payload.superuser;
                server.state = 'RUNNING';
			    server.save().then((response)=>{
    		    	console.log("UPDATE_AND READY SERVER", response);
    		    	notifier({
    		    	    uid: req.techpool.user.uid,
    			    	data: {
    				    	ACTION: "UPDATE_SERVER",
    				    	O_REQ: null,
    				    	MESSAGE: 'RUNNING',
    				    	DATA: response
    			    	}
    		    	});
    		    	notifier({
                        uid: req.techpool.user.uid,
        		    	data: {
        			    	ACTION: "CREATE_INSTANCE",
        			    	O_REQ: null,
        			    	MESSAGE: "READY",
        			    	DATA: response,
        		    	}
        		    });
			    }).catch((err)=>{
			    	console.log("SUPER_SERVER_UPDATE Err", err);
			    });
            }).catch((error)=>{
               console.log("findOne Server: Empty");
               console.log("EVENT", payload, error);
               //TODO: Log
            });
            
            UserApp.findOne({
                uid: req.techpool.user.uid, 
                app_name: payload.app_name,
                server: payload.server_id
            }).then((app)=>{
                app.state = 'RUNNING';
                app.port = payload.port;
			    app.save().then((response)=>{
			    	console.log("UPDATE_APP", response);
			    	notifier({
			    	    uid: req.techpool.user.uid,
				    	data: {
					    	ACTION: "UPDATE_APP",
					    	O_REQ: null,
					    	MESSAGE: "RUNNING",
					    	DATA: response
				    	}
			    	});
			    	notifier({
                        uid: req.techpool.user.uid,
        		    	data: {
        			    	ACTION: "CREATE_APP",
        			    	O_REQ: null,
        			    	MESSAGE: "READY",
        			    	DATA: response
        		    	}
        		    });
			    }).catch((err)=>{
			    	console.log("UPDATE_APP Err", err);
			    });
            }).catch((error)=>{
               console.log("findOne App: Empty");
               console.log("EVENT", payload, error);
            });
        }else if(payload.type == "CREATE_APP_SUCCESS"){
            
            UserApp.findOne({
                uid: req.techpool.user.uid, 
                server: payload.server_id, 
                _id: payload.app_id //should we want to allow multiple app name (diff template) per server
            }).then((app)=>{
                app.state = 'RUNNING';
                app.port = payload.port;
			    app.save().then((response)=>{
    		    	console.log("UPDATE_APP", response);
    		    	notifier({
    		    	    uid: req.techpool.user.uid,
				    	data: {
					    	ACTION: "SERVER_UPDATE",
					    	O_REQ: null,
					    	MESSAGE: 'NEW APP RUNNING',
					    	DATA: response
				    	}
			    	});
			    }).catch((err)=>{
			    	console.log("UPDATE_APP ERR", err);
			    });
            }).catch((error)=>{
               console.log("findOne Server: Empty");
               console.log("EVENT", payload, error);
               //TODO: Log
            });
        }else if(payload.type == "DEPLOY_LOGS"){
            console.log(req.file, req.body);
        }else if(payload.type == "SERVER_LOGS"){
            console.log(req.file, req.body);
        
        }else{
            console.log("UNHANDLED EVENTS", payload);
        }
        
	});
	
	app.post('/v1/events', LogEvent, upload.single('file'), function (req, res, next) {
        console.log("General Webhook Received: ", req.body.type);
        res.status(200).json({status: "success", message: "RECV"});
        var payload = req.body;
        if(payload.type == "CREATE_SERVER_SUCCESS"){
            UserServer.findOne({
                _id: payload.server_id
            }).then((server)=>{
                server.superuser = payload.superuser;
                server.state = 'RUNNING';
			    server.save().then((response)=>{
    		    	console.log("UPDATE_AND READY SERVER", response);
    		    	notifier({
    		    	    uid: server.uid,
    			    	data: {
    				    	ACTION: "UPDATE_SERVER",
    				    	O_REQ: null,
    				    	MESSAGE: 'RUNNING',
    				    	DATA: response
    			    	}
    		    	});
    		    	notifier({
                        uid: server.uid,
        		    	data: {
        			    	ACTION: "CREATE_INSTANCE",
        			    	O_REQ: null,
        			    	MESSAGE: "READY",
        			    	DATA: response,
        		    	}
        		    });
			    }).catch((err)=>{
			    	console.log("SUPER_SERVER_UPDATE Err", err);
			    });
            }).catch((error)=>{
               console.log("findOne Server: Empty");
               console.log("EVENT", payload, error);
               //TODO: Log
            });
            
            UserApp.findOne({
                app_name: 'default',
                server: payload.server_id
            }).then((app)=>{
                app.state = 'RUNNING';
                app.port = payload.port;
			    app.save().then((response)=>{
			    	console.log("UPDATE_APP", response);
			    	notifier({
			    	    uid: app.uid,
				    	data: {
					    	ACTION: "UPDATE_APP",
					    	O_REQ: null,
					    	MESSAGE: "RUNNING",
					    	DATA: response
				    	}
			    	});
			    	notifier({
                        uid: app.uid,
        		    	data: {
        			    	ACTION: "CREATE_APP",
        			    	O_REQ: null,
        			    	MESSAGE: "READY",
        			    	DATA: response
        		    	}
        		    });
			    }).catch((err)=>{
			    	console.log("UPDATE_APP Err", err);
			    });
            }).catch((error)=>{
               console.log("findOne App: Empty");
               console.log("EVENT", payload, error);
            });
        }else if(payload.type == "CREATE_DATABASE_SUCCESS"){
            UserDatabase.findOne({
                uid: req.techpool.user.uid, 
                server: payload.server_id, 
                _id: payload.db_id
            }).then((database)=>{
                database.state = 'CREATE_SUCCESS';
			    database.save().then((response)=>{
    		    	console.log("UPDATE_DATABASE", response);
    		    	notifier({
    		    	    uid: req.techpool.user.uid,
				    	data: {
					    	ACTION: "SERVER_UPDATE",
					    	O_REQ: null,
					    	MESSAGE: 'NEW DATABASE CREATED',
					    	DATA: response
				    	}
			    	});
			    }).catch((err)=>{
			    	console.log("UPDATE_DATABASE ERR", err);
			    });
            }).catch((error)=>{
               console.log("findOne Database: Empty");
               console.log("EVENT", payload, error);
               //TODO: Log
            });
        }else if(payload.type == "TOGGLE_SSL_SUCCESS"){
            UserApp.findOne({
                server: payload.server_id, 
                _id: payload.app_id
            }).then((app)=>{
                app.ssl_enabled = !app.ssl_enabled;
			    app.save().then((response)=>{
    		    	console.log("UPDATE_APP", response);
    		    	notifier({
    		    	    uid: req.techpool.user.uid,
				    	data: {
					    	ACTION: "UPDATE_APP",
					    	O_REQ: null,
					    	MESSAGE: 'SSL TOGGLED',
					    	DATA: response
				    	}
			    	});
			    }).catch((err)=>{
			    	console.log("UPDATE_APP ERR", err);
			    });
            }).catch((error)=>{
               console.log("findOne TOGGLE_SSL_SUCCESS App: Empty");
               console.log("EVENT", payload, error);
               //TODO: Log
            });
        }else{
            console.log("UNHANDLED EVENTS", payload);
        }
	});
};