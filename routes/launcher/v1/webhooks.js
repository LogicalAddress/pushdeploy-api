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

module.exports = function (app, io) {
	app.post('/v1/server/events', Auth, Cred, LogEvent, upload.single('file'), function (req, res, next) {
        console.log("Webhook Received: ", req.body.type);
        res.status(200).json({status: "success", message: "RECV"});
        var payload = req.body;
        if(payload.type == "CREATE_SERVER_SUCCESS"){
            UserServer.findOne({uid: req.techpool.user.uid, _id: payload.server_id})
            .then((server)=>{
                server.superuser = payload.superuser;
				server.state = 'RUNNING';
				server.lock = false;
			    server.save().then((response)=>{
					try{
                        io.to(server.uid).emit('CREATE_SERVER_READY', response);
                    }catch(err){
                        console.log("socket.io failed", err.message);
					}
    		    	console.log("UPDATE_AND READY SERVER", response);
    		    	notifier({
						uid: server.uid,
						status: 'success',
    			    	data: {
    				    	ACTION: "UPDATE_SERVER",
    				    	O_REQ: null,
    				    	MESSAGE: 'RUNNING',
    				    	DATA: response
    			    	}
    		    	});
    		    	notifier({
						uid: server.uid,
						status: 'success',
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
				app.lock = false;
                app.port = payload.port;
			    app.save().then((response)=>{
					console.log("UPDATE_APP", response);
					try{
                        io.to(app.uid).emit('CREATE_APP_READY', response);
                    }catch(err){
                        console.log("socket.io failed", err.message);
					}
			    	notifier({
						uid: app.uid,
						status: 'success',
				    	data: {
					    	ACTION: "UPDATE_APP",
					    	O_REQ: null,
					    	MESSAGE: "RUNNING",
					    	DATA: response
				    	}
			    	});
			    	notifier({
						uid: app.uid,
						status: 'success',
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
				app.lock = false;
			    app.save().then((response)=>{
					console.log("UPDATE_APP", response);
					try{
                        io.to(app.uid).emit('CREATE_APP_READY', response);
                    }catch(err){
                        console.log("socket.io failed", err.message);
					}
    		    	notifier({
						uid: app.uid,
						status: 'success',
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
		}else if(payload.type == "DELETE_APP_SUCCESS"){
			try{
				io.to(app.uid).emit('DELETE_APP_SUCCESS', payload.app_name);
			}catch(err){
				console.log("socket.io failed", err.message);
			}
			notifier({
				uid: req.techpool.user.uid,
				status: 'success',
				data: {
					ACTION: "DELETE_APP_SUCCESS",
					O_REQ: null,
					MESSAGE: payload.app_name,
					DATA: payload
				}
			});
		}else if(payload.type == "DEPLOY_APP_SUCCESS"){
				UserApp.findOne({
					server: payload.server_id, 
					_id: payload.app_id
				}).then((app)=>{
					try{
						io.to(app.uid).emit('DEPLOY_APP_READY', app);
					}catch(err){
						console.log("socket.io failed", err.message);
					}
					notifier({
						uid: app.uid,
						status: 'success',
						data: {
							ACTION: "UPDATE_APP",
							O_REQ: null,
							MESSAGE: 'APP DEPLOYED',
							DATA: app
						}
					});
				}).catch((error)=>{
				   console.log("findOne DEPLOY_APP_SUCCESS App: Empty");
				   console.log("EVENT", payload, error);
				   //TODO: Log
				});
		}else if(payload.type == "DEPLOY_LOGS"){
			console.log("=======DEPLOY_LOGS HOOKS=========");
            console.log(req.file, req.body);
        }else if(payload.type == "SERVER_LOGS"){
			console.log("=======SERVER_LOGS HOOKS=========");
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
				server.lock = false;
			    server.save().then((response)=>{
					console.log("UPDATE_AND READY SERVER", response);
					try{
                        io.to(server.uid).emit('CREATE_SERVER_READY', response);
                    }catch(err){
                        console.log("socket.io failed", err.message);
					}
    		    	notifier({
						uid: server.uid,
						status: 'success',
    			    	data: {
    				    	ACTION: "UPDATE_SERVER",
    				    	O_REQ: null,
    				    	MESSAGE: 'RUNNING',
    				    	DATA: response
    			    	}
    		    	});
    		    	notifier({
						uid: server.uid,
						status: 'success',
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
				app.lock = false;
                app.port = payload.port;
			    app.save().then((response)=>{
			    	console.log("UPDATE_APP", response);
			    	notifier({
						uid: app.uid,
						status: 'success',
				    	data: {
					    	ACTION: "UPDATE_APP",
					    	O_REQ: null,
					    	MESSAGE: "RUNNING",
					    	DATA: response
				    	}
			    	});
			    	notifier({
						uid: app.uid,
						status: 'success',
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
                server: payload.server_id, 
                _id: payload.db_id
            }).then((database)=>{
                database.state = 'CREATE_SUCCESS';
			    database.save().then((response)=>{
					console.log("UPDATE_DATABASE", response);
					try{
                        io.to(database.uid).emit('CREATE_DATABASE_READY', response);
                    }catch(err){
                        console.log("socket.io failed", err.message);
					}
    		    	notifier({
						uid: database.uid,
						status: 'success',
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
					try{
                        io.to(app.uid).emit('TOGGLE_SSL_READY', response);
                    }catch(err){
                        console.log("socket.io failed", err.message);
					}
    		    	notifier({
						uid: app.uid,
						status: 'success',
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
			   notifier({
					status: 'system error',
					error: error.message,
					file: __filename,
					data: {
						ACTION: "UPDATE_APP",
						MESSAGE: 'SSL TOGGLED',
						DATA: payload
					}
				});
			});
		}else{
			console.log("UNHANDLED EVENTS", payload);
			notifier({
				status: 'system error',
				error: "UNHANDLED EVENTS",
				file: __filename,
			});
        }
	});
};