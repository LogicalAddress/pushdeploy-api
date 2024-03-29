var Server = require("../../lib/launcher/UserServers");

module.exports = function(_app, socketIO){
    process.on('user_app_deleted', function(app){
        // Caching via redundancy
        console.log("EVENT", "user_app_deleted", "LISTNER", "remove_app_from_server");
    	Server.removeApp(app).then(function(server){
            console.log("Remove App from: ", app);
    	}).catch(function(err) {
    	    console.log("Remove App", app, "Err", err);
    	});
    	
    });	
};