// jshint ignore: start
var UserApp = require('../../lib/launcher/UserApps'), 
notifier = require("../../lib/launcher/notifier");

module.exports = function(req, _app){
	UserApp.delete(_app).then((response)=>{
		console.log("DEL APP", _app, response.result);
	}).catch((err)=>{
		console.log("DEL APP ERR", _app, err);
	});
	//The rest should be taken care of through event emitters in the App.delete Fn.
	notifier({
		uid: _app.uid || '',
		status: 'failed',
    	data: {
	    	ACTION: "CREATE_APP",
	    	O_REQ: req.body,
	    	MESSAGE: "rollback",
	    	DATA: _app
    	}
    });
};