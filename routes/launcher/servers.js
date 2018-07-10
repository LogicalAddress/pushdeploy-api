var User = require("../../lib/User");
var Auth = require("../../lib/middlewares/authenticate");
var Servers = require("../../lib/launcher/UserServers");

module.exports = function (app) {
	app.post('/v1/launcher/server', Auth, function (req, res, next) {
		// console.log(req.body);
		// return res.send({status: "success", data: ['server1', 'server2']});
// 		User.create(req.body).then((record)=>{
// 			var access_token = User.object2Token(record);
// 		    record.access_token = access_token;
// 			res.status(200).json({status: "success", data: record});
// 		}).catch((error)=>{
// 		    res.status(500).json({status: 'failure', message: error});
// 		});			
	});
	
	app.get('/v1/launcher/server', Auth, function (req, res, next) {
		Servers.findAllByUid(req.techpool.user.uid).then((record)=>{
			res.status(200).json({body: { status: "success", data: record}});
		}).catch((error)=>{
		    res.status(500).json({status: 'failure', message: error});
		});			
	});
};