var AppCounter = require('../../lib/launcher/AppCounter');
var Server = require("../../lib/launcher/UserServers");

module.exports = function(_app, socketIO){
    process.on('user_app_created', function(app){
        console.log("EVENT", "user_app_created", "LISTNER", "increment_server_app_count");
        AppCounter.incrementAppCounter(app).then(function(response){
            // Silence is golden
            console.log("AppCounter", response);
    	}).catch(function(err) {
    	    console.log(err);
    	});
    	
    	Server.appplusplus(app).then(function(response){
            // Silence is golden
            console.log("Server:AppPlusPlus", response);
    	}).catch(function(err) {
    	    console.log("Server:AppPlusPlus", err);
    	});
    	
    });	
};