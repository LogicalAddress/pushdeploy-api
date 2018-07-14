var Auth = require("../../lib/middlewares/authenticate");

module.exports = function (app) {
    
	app.post('/v1/app/validate', Auth, function (req, res, next) {
		console.log(req.body);
		return res.send({status: "success", echo: req.body});
	});
};