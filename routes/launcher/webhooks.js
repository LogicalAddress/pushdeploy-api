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
            notifier({
                uid: req.techpool.user.uid,
		    	data: {
			    	ACTION: "CREATE_INSTANCE",
			    	O_REQ: null,
			    	RESPONSE: "ready"
		    	}
		    });
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
    				    	RESPONSE: response
    			    	}
    		    	});
			    }).catch((err)=>{
			    	console.log("SUPER_SERVER_UPDATE", err);
			    });
            }).catch((error)=>{
               console.log("findOne Server: Empty");
               console.log("EVENT", payload, error);
               //TODO: Log
            });
            notifier({
                uid: req.techpool.user.uid,
		    	data: {
			    	ACTION: "CREATE_APP",
			    	O_REQ: null,
			    	RESPONSE: "ready"
		    	}
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
					    	RESPONSE: response
				    	}
			    	});
			    }).catch((err)=>{
			    	console.log("UPDATE_APP", err);
			    });
            }).catch((error)=>{
               console.log("findOne App: Empty");
               console.log("EVENT", payload, error);
            });
        }else{
            console.log("UNHANDLED EVENTS", payload);
        }
        
	});
};