var UserDatabase = require("../../lib/launcher/UserDatabase");

module.exports = function(){
    process.on('user_server_deleted', function(query){
        // Caching via redundancy
        console.log("EVENT", "user_server_deleted", "LISTNER", "delete_database");
    	UserDatabase.delete({server: query._id}).then(function(db){
            console.log("Remove DBs ref: ", db);
    	}).catch(function(err) {
    	    console.log("Remove DBs", query, "Err", err);
    	});
    	
    });	
};