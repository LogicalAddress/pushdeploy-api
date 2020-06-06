var AppDeployLog = require("../../lib/launcher/AppDeployLog");

module.exports = function(){
    process.on('user_app_deleted', function(query){
        console.log("EVENT", "user_app_deleted", "LISTNER", "delete_apps_deploy_logs");
    	AppDeployLog.delete({server: query.server}).then(function(){
            console.log("Remove AppDeployLog ref: ", query);
    	}).catch(function(err) {
    	    console.log("Remove AppDeployLog", query, "Err", err);
    	});
    	
    });	
};