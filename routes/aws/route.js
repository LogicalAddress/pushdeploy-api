var Aws = require('../../lib/aws/lib');
var Auth = require("../../lib/middlewares/authenticate");
var _ = require("underscore");
var Cred = require("../../lib/middlewares/credentials");
var UserServer = require("../../lib/launcher/UserServers");
var generate = require('project-name-generator');
	/*
	* Aws Create EC2 Server
	*/
	
	
module.exports = function (app, socketIO) {
	
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
			req.io = socketIO;
			Aws.createInstance(payload, req.techpool.credentials, server, req).then((result)=>{
				console.log("DEBUG", "Aws.createInstance", result);
				var response = Object.assign(server.toObject(), {instanceId: result.InstanceId, aws_reservation_id: result.raw.ReservationId});
				console.log("Response", response);
	    		res.status(200).json({body: { status: "IN_PROGRESS", data: response}});
	    	}).catch((error)=>{
	    		console.log("RunInstance Error DEBUG", "Aws.createInstance", error);
	    		console.log("Undo Create Server etal");
	    		UserServer.deleteServer(server).then((response)=>{
	    			console.log("Deleted Server " + server.server_name);
	    			console.log("Hopefuly only relevant authcred are unset");
	    		}).catch((error)=>{
	    			console.log("Deleting Server " + server.server_name + " failed");
	    		});
	    		res.status(500).json({ status: 'failure', message: error.message || error});	
	    	});
    	}).catch(function(err) {
    	    console.log(err);
    	    res.status(500).json({ status: 'failure', message: "Unable to create your server.."});
    	    return;
    	});
			
	});
	
	app.post('/v1/aws/update_instance_state', Auth, Cred, (req, res, next) => {
		var payload = Object.assign(req.body, {
			uid: req.techpool.user.uid});
		UserServer.findById({
            uid: payload.uid,
            _id: payload.server_id || payload._id
        }).then(function(server){
			Aws.instance({
        		accessKeyId: server.accessKeyId, 
        		secretAccessKey: server.secretAccessKey,
        		region: server.aws_region,
        		instanceId: server.instanceId
        	}).then((result)=>{
				server.ipv4 = result.Reservations[0].Instances[0].PublicIpAddress;
				server.state = result.Reservations[0].Instances[0].State.Name;
				server.save().then((response)=>{
					console.log("Updating server with aws instance state");
					res.status(200).json({body: { status: "success", data: server}});
					return;
				}).catch((error)=>{
					console.log("Updating server with aws instance state failed");
					res.status(500).json({ status: 'failure', message: "Unable to update instance state"});	
					return;
				});
	    	}).catch((error)=>{
	    		console.log("DEBUG", "Aws.createInstance", error);
	    		res.status(500).json({ status: 'failure', message: error});	
	    	});
    	}).catch(function(err) {
    	    console.log(err);
    	    res.status(500).json({ status: 'failure', message: "Unable to find your server.."});
    	    return;
    	});
			
	});
	
	
	
};