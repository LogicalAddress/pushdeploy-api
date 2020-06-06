var User = require("../../../lib/User");
var Auth = require("../../../lib/middlewares/authenticate");
var Servers = require("../../../lib/launcher/UserServers");

module.exports = function (app, socketIO) {
	
	app.get('/v1/servers', Auth, function (req, res, next) {
		Servers.findAllByUid(req.techpool.user.uid).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});

	app.get('/v1/servers/:id', Auth, function (req, res, next) {
		Servers.findOne({uid: req.techpool.user.uid, _id: req.params.id}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});

	app.delete('/v1/servers/:id', Auth, function (req, res, next) {
		Servers.delete({uid: req.techpool.user.uid, _id: req.params.id}).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};