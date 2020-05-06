// jshint ignore: start
var UserApp = require('../../lib/launcher/UserApps'), 
AppCounter = require('../../lib/launcher/AppCounter'),
notifier = require("../../lib/launcher/notifier"),
UserServer = require("./UserServers");

module.exports = function(req, _server){
	UserApp.deleteServerApps(_server).then((response)=>{
		console.log("DEL APPS", response.result);
	}).catch((err)=>{
		console.log("DEL APPS", err);
	});
	UserServer.deleteServer(_server).then((response)=>{
		console.log("DEL SERVER", _server, response.result);
	}).catch((err)=>{
		console.log("DEL SERVER", _server, err);
	});
	AppCounter.deleteServer(_server).then((response)=>{
		console.log("DEL APPCOUNTER", response.result);
	}).catch((err)=>{
		console.log("DEL APPCOUNTER", err);
	});
	try{
        req.io.to(_server.uid).emit('CREATE_SERVER_FAILED', _server);
    }catch(err){
        console.log("socket.io failed", err.message);
    };
	notifier({
		uid: _server.uid,
		status: 'failed',
    	data: {
	    	ACTION: "CREATE_INSTANCE",
	    	O_REQ: req.body,
	    	RESPONSE: "rollback",
	    	O_RES: _server
    	}
    });
};