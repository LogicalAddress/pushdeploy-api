var AppCounter = require('../../lib/launcher/AppCounter');
var AppConfig = require('../../config/app');

module.exports = function(){
    process.on('user_server_created', function(server){
        AppCounter.create({server: server._id}).then(function(response){
            // Silence is golden
    	}).catch(function(err) {
    	    console.log(err);
    	});
    });	
};