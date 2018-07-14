var Aws = require('../../lib/aws/lib');
var Auth = require("../../lib/middlewares/authenticate");
var _ = require("underscore");
	/*
	* Whois Search (Using Enom)
	*/
	
	
module.exports = function (app) {
	
	app.post('/v1/aws/instances', Auth, (req, res, next) => {
		var payload = Object.assign(req.body, {
			uid: req.techpool.user.uid,
			// accessKeyId: req.body.accessKeyId,
			// secretAccessKey: req.body.secretAccessKey,
			// volumeSize: req.body.volumeSize
			// InstanceType: req.body.InstanceType
		});
		Aws.createInstance(payload).then((result)=>{
			console.log("DEBUG", result);
    		res.status(200).json({body: { status: "IN_PROGRESS", data: result}});
    	}).catch((error)=>{
    		console.log("DEBUG", error);
    		res.status(500).json({ status: 'failure', message: error});	
    	});
	});
	
	
	
};