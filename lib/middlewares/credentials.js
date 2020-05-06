var _ = require('underscore');
var UserAuthCredential = require("../launcher/UserAuthCredential");

module.exports = function (req, res, next)
{
	if(req.techpool && req.techpool.credentials){
		//Some middleware has Done-This-Done-That
		next();
		return;
	}
	UserAuthCredential.findByUID(req.techpool.user.uid).then((record)=>{
		req.techpool = req.techpool || {};
		req.techpool.credentials = record;
		next();
	}).catch((error)=>{
		console.log(error);
	    res.status(500).json({status: 'failure', message: "User Authentication Credential Query Failed"});
	});

};