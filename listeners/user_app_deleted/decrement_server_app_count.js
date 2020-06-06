var AppCounter = require('../../lib/launcher/AppCounter');
var Server = require("../../lib/launcher/UserServers");

module.exports = function(_app, socketIO){
    process.on('user_app_deleted', function(app){
        console.log("EVENT", "user_app_deleted", "LISTNER", "decrement_server_app_count");
        AppCounter.decrementAppCounter(app).then(function(response){
            // Silence is golden
            console.log("AppCounter", app);
    	}).catch(function(err) {
    	    console.log(err);
    	});
    	
    	Server.appminusminus(app).then(function(response){
            // Silence is golden
            console.log("Server:AppMinusMinus", app);
    	}).catch(function(err) {
    	    console.log("Server:AppMinusMinus", err);
    	});
    	
    });	
};