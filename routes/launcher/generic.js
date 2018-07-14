var Auth = require("../../lib/middlewares/authenticate");
var Cred = require("../../lib/middlewares/credentials");
var Helper = require("../../launcher/Generic");

module.exports = function (app) {
    
	app.post('/v1/app/validate', Auth, Cred, function (req, res, next) {
		/*
		{ template: 'nodejs',
          template_variation: 'v8.9.3',
          app_repository: 'https://github.com/repo-utils/parse-github-repo-url.git',
          app_name: 'retnan.com',
          server: '5b499a7298fd450bd6ef5af9',
          git_provider: 'github' }
          */
         Helper.getRepoDetails(req.body).then((profile)=>{
             
         }).catch((error)=>{
             res.status(500).json({status: 'failure', message: error});
         });
	});
};