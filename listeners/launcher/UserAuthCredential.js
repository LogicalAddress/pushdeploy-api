var UserAuthCredential = require('../../lib/launcher/UserAuthCredential');
var AppConfig = require('../../config/app');

//https://coolaj86.com/articles/asymmetric-public--private-key-encryption-in-node-js/
//https://github.com/joyent/node-sshpk
//https://github.com/joyent/node-sshpk-agent
var ursa = require('ursa');
var bits = 2048;

module.exports = function(){
    
    process.on('user_created', function(user){
        var key = ursa.generatePrivateKey(bits, 65537);
        var privkeypem = key.toPrivatePem();
        var pubkeypem = key.toPublicPem();
    	UserAuthCredential.upsert({
    	    uid: user.uid,
    	    custom_private_key: privkeypem.toString('ascii'),
    	    custom_public_key: pubkeypem.toString('ascii')
    	}).then(function(userCredential){
            // Silence is golden
            console.log(userCredential);
    	}).catch(function(err) {
    	    console.log(err);
    	});
    });

};