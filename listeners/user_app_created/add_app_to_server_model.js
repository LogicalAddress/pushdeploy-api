var AppCounter = require('../../lib/launcher/AppCounter');
var Server = require("../../lib/launcher/UserServers");

module.exports = function(){
    process.on('user_app_created', function(app){
        // Caching via redundancy
        console.log("EVENT", "user_app_created", "LISTNER", "add_app_to_server_model");
    	Server.findOne({_id: app.server}).then(function(server){
            server.apps.push(app);
            server.save().then((updatedServer)=>{
                console.log("Add_app_to_server_model:update", updatedServer);
            }).catch((err)=>{
                console.log("Add_app_to_server_model:update", err);    
            });
    	}).catch(function(err) {
    	    console.log("Add_app_to_server_model:Init", err);
    	});
    	
    });	
};