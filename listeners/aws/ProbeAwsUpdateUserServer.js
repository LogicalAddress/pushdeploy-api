var UserServer = require('../../lib/launcher/UserServers'),
notifier = require("../../lib/launcher/notifier"),
Aws = require('../../lib/aws/lib');

module.exports = function(){
    process.on('aws_instance_created', function(bigPayload, server){
        
        var Id = setInterval(()=>{
            console.log("Probing EC2 Server every 5th second Until we get an IP");
    		UserServer.findById({
                _id: server._id
            }).then(function(_server){
    			Aws.instance({
            		accessKeyId: bigPayload.payload.accessKeyId, 
            		secretAccessKey: bigPayload.payload.secretAccessKey,
            		region: bigPayload.payload.region,
            		instanceId: _server.instanceId
            	}).then((result)=>{
            	    console.log("Result from probe", result);
            	    if(result.Reservations[0].Instances[0].State.Name === "running"){
            	        console.log("server is up and kicking ass (running..)");
        				_server.ipv4 = result.Reservations[0].Instances[0].PublicIpAddress;
        				_server.state = result.Reservations[0].Instances[0].State.Name.toUpperCase();
        				_server.save().then((response)=>{
        					console.log("Updating server with aws instance state");
        					notifier({
                            	data: {
                        	    	ACTION: "CREATE_AWS_SERVER",
                        	    	O_REQ: bigPayload.payload,
                        	    	MESSAGE: "ready",
                        	    	DATA: _server
                            	}
                            });
                            clearInterval(Id);
        				}).catch((error)=>{
        					console.log("Updating server with aws instance state failed - This is bad");
        					clearInterval(Id);
    				    });
    				}else{
    				    console.log("server not yet in running state. Current state is", result.Reservations[0].Instances[0].State.Name);
    				    console.log("is ipv4 ready? let's find out: ", result.Reservations[0].Instances[0].PublicIpAddress);
    				    console.log("retry in 5sec...");
    				}
    	    	}).catch((error)=>{
    	    		console.log("Aws Probe DEBUG", "Aws.instance", error);
    	    		console.log("Tring again in 5 seconds..");
    	    	});
            }).catch((error)=>{
                console.log("Something has probanly deleted the server...failing religously");
                clearInterval(Id);
            });
        }, 10000);
        
    });	
};