var Aws = require('../../lib/aws/lib');
var Auth = require("../../lib/middlewares/authenticate");
var _ = require("underscore");
var Cred = require("../../lib/middlewares/credentials");
var UserServer = require("../../lib/launcher/UserServers");
var generate = require('project-name-generator');
	/*
	* Aws Create EC2 Server
	*/
	
	
module.exports = function (app) {
	
	app.post('/v1/aws/instances', Auth, Cred, (req, res, next) => {
		var payload = Object.assign(req.body, {
			uid: req.techpool.user.uid});
		UserServer.create({
            uid: payload.uid,
            server_name: generate({ number: true }).dashed, // 'disgraceful-temper-7794'
            // ipv4: 'priv',
            // instanceId: ciResponse.InstanceId,
            provider: payload.provider || 'aws',
            meta: JSON.stringify(payload)//JSON.stringify(bigPayload)
        }).then(function(server){
        	console.log("CREATE SERVER:", server);
        	// bigPayload = Object.assign(bigPayload, {server: server});
            // process.emit('aws_instance_created', bigPayload);
			// return resolve(ciResponse);
			Aws.createInstance(payload, req.techpool.credentials, server).then((result)=>{
				console.log("DEBUG", "Aws.createInstance", result);
				var response = Object.assign(server.toObject(), {aws_reservation_id: result.raw.ReservationId});
				console.log("Response", response);
	    		res.status(200).json({body: { status: "IN_PROGRESS", data: response}});
	    	}).catch((error)=>{
	    		console.log("DEBUG", "Aws.createInstance", error);
	    		res.status(500).json({ status: 'failure', message: error});	
	    	});
    	}).catch(function(err) {
    	    console.log(err);
    	    //TODO: undo create server here
    	    //Unset AuthCredCredentials
    	});
			
	});
	
	
	
};