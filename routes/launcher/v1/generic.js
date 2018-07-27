var Auth = require("../../../lib/middlewares/authenticate"),
Cred = require("../../../lib/middlewares/credentials"),
getRepoDetails = require("../../../lib/launcher/getRepoDetails"),
App = require('../../../lib/launcher/UserApps');

module.exports = function (app) {
    
	app.post('/v1/app/validate', Auth, Cred, function (req, res, next) {
        console.log(req.body);
        App.findOne({
            uid: req.techpool.user.uid,
            server: req.body.server,
            app_name: req.body.app_name
        }).then((app)=>{
            console.log("APP QUERY", app);
            //in v10 if we ever get there. 
            //One should be able to deploy say django on the same domain 
            //nodejs is deployed. The shellscript would be upgraded for that to happen
            if(app && app.app_repository != req.body.app_repository){
                return res.status(400).json({status: 'failure', message: "app_exists"});
            }
            getRepoDetails(req.body, req.techpool.credentials).then((profile)=>{
                console.log("REQ getRepoDetails: ", profile);
                return res.status(200).json({body: { status: "success", data: profile}});
            }).catch((error)=>{
                console.log("getRepoDetails", error);
                return res.status(400).json({status: 'failure', message: error});
            });
        }).catch((error)=>{
            console.log("App.findOne Error", error);
        	return res.status(500).json({status: 'failure', message: error});
        });
	});
};