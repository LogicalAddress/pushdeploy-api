var AppCounter = require('../../lib/launcher/AppCounter');
var Server = require("../../lib/launcher/UserServers");

module.exports = function(_app, socketIO){
    process.on('user_app_created', function(app){
        // Caching via redundancy
        console.log("EVENT", "user_app_created", "LISTNER", "add_app_to_server_model");
        console.log({app});
        Server.addApp(app).then(function(server){
            //See why we comment: https://stackoverflow.com/questions/48607918/mongoerror-unknown-modifier-pushall-in-node-js#48621806
            // server.apps.push(app);
            // server.apps.concat([app._id]);
            // server.save().then((updatedServer)=>{
                // console.log("Add_app_to_server_model:update", server);
            // }).catch((err)=>{
            //     console.log("Add_app_to_server_model:update", err);    
            // });
    	}).catch(function(err) {
    	    console.log("Add_app_to_server_model:Init", err);
    	});
    	
    });	
};