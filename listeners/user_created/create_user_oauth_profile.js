var UserAuthCredential = require('../../lib/launcher/UserAuthCredential');
var AppConfig = require('../../config/app');

var keypair = require('keypair');
var forge = require('node-forge');
var hat = require('hat');

module.exports = function(){
    
    /*
     [Error: Encrypted private key detected, but no passphrase given]
     */
    
    process.on('user_created', function(user){
        var key = keypair();
        var privkeypem = key.private;
        var pubkeypem = key.public;
    	UserAuthCredential.upsert({
    	    uid: user.uid,
    	    db_root_password: hat(),
    	    custom_private_key: forge.ssh.privateKeyToOpenSSH(
    	       forge.pki.privateKeyFromPem(privkeypem)),
    	    custom_public_key: forge.ssh.publicKeyToOpenSSH(
    	       forge.pki.publicKeyFromPem(pubkeypem), user.email),
    	}).then(function(userCredential){
            // Silence is golden
            console.log(userCredential);
    	}).catch(function(err) {
    	    console.log(err);
    	});
    });

};