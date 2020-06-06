var UserApps = require("../../lib/launcher/UserApps");

module.exports = function(){
    process.on('user_server_deleted', function(query){
        console.log("EVENT", "user_server_deleted", "LISTNER", "delete_apps");
    	UserApps.delete({server: query._id}).then(function(data){
            console.log("Remove Apps ref: ", data);
    	}).catch(function(err) {
    	    console.log("Remove Apps", query, "Err", err);
    	});
    	
    });	
};