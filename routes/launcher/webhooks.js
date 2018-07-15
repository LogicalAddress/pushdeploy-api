var Auth = require("../../lib/middlewares/authenticate"),
Cred = require("../../lib/middlewares/credentials"),
LogEvent = require("../../lib/middlewares/logevent"),
UserServer = require('../../lib/launcher/UserServers'),
UserApp = require('../../lib/launcher/UserApps'),
notifier = require('../../lib/launcher/notifier');

module.exports = function (app) {
    
	app.post('/v1/server/events', Auth, Cred, LogEvent, function (req, res, next) {
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
        }else{
            console.log("UNHANDLED EVENTS", payload);
        }
        
	});
};