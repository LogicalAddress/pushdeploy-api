var UserServer = require('../../lib/launcher/UserServers');
var AppConfig = require('../../config/app');
var generate = require('project-name-generator');

module.exports = function(){
    process.on('aws_instance_created', function(data){
        UserServer.create({
            uid: data.payload.uid,
            server_name: generate({ number: true }).dashed, // 'disgraceful-temper-7794'
            ipv4: 'priv',
            instanceId: data.instance.InstanceId,
            provider: data.payload.provider || 'aws',
            meta: JSON.stringify(data)
        }).then(function(response){
            // Silence is golden
    	}).catch(function(err) {
    	    console.log(err);
    	});
    });	
};