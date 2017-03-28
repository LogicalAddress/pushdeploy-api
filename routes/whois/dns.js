var Domain = require('../../lib/whois/lib.js');

	/*
	* Whois Search (Using Enom)
	*/
	
	
module.exports = function (app) {
    
    /*
    * get the current nameservers for this domain
    */
    app.get('/v1/whois/nameserver/:domain', (req, res, next) => {
		var domain = req.params.domain.split('.');
		Domain.getCurrentNameServers({sld: domain[0], tld: domain[1] || 'com'}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.put('/v1/whois/nameserver/:domain', (req, res, next) => {
		Domain.setCustomNameServer({}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/whois/nameserver/ng/:domain', (req, res, next) => {
		var domain = req.params.domain.split('.');
		res.status(200).json({message: "Not Implemented"});
	});
	
	app.put('/v1/whois/nameserver/ng/:domain', (req, res, next) => {
    		res.status(200).json({message: "Not Implemented"});
	});
	
	app.get('/v1/whois/configs', (req, res, next) => {
		Domain.getDefaultConfigs().then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
};