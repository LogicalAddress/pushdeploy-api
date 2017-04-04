var AppCounter = require('../../lib/userspace/AppCounter');
var AppConfig = require('../../config/app');

module.exports = function(){
    process.on('user_server_created', function(server){
        AppCounter.findOrCreate(server._id).then(function(response){
            // Silence is golden
            console.log(response);
    	}).catch(function(err) {
    	    console.log(err);
    	});
    });	
};