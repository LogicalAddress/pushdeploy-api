var UserAuthCredential = require('../../lib/launcher/UserAuthCredential');
var AppConfig = require('../../config/app');

module.exports = function(){
    
    process.on('user_created', function(user){
    	UserAuthCredential.upsert({uid: user.uid}).then(function(userCredential){
            // Silence is golden
            console.log(userCredential);
    	}).catch(function(err) {
    	    console.log(err);
    	});
    });

};