// jshint ignore: start
var UserDatabase = require('../../lib/launcher/UserDatabase'), 
notifier = require("../../lib/launcher/notifier");

module.exports = function(req, _database){
	UserDatabase.delete(_database).then((response)=>{
		console.log("DEL DATABASE", _database, response.result);
	}).catch((err)=>{
		console.log("DEL DATABASE ERR", _database, err);
	});
	//The rest should be taken care of through event emitters in the UserDatabase.delete Fn.
	notifier({
		uid: _database.uid || '',
		status: 'failed',
    	data: {
	    	ACTION: "CREATE_DATABASE",
	    	O_REQ: req.body,
	    	MESSAGE: "rollback",
	    	DATA: _database
    	}
    });
};