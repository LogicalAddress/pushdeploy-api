
module.exports = function (app) {
	
	app.get('/', function (req, res, next) {
		res.send("TechPool");
	});
	/* ACME CHALLENGE */
	app.get('/.well-known/acme-challenge/:letsencrypt', function (req, res, next) {
		var request = req.params.letsencrypt;
		if(request.substr(0, 3) == 'key'){
			return res.status(200).set("Content-Type", "text/plain").send(request);
		}else{
			return res.status(200).set("Content-Type", "text/plain").send(request);
		}
	});
};