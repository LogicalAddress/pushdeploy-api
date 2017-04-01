var Domain = require('../../lib/whois/enom.js');
var _ = require('underscore');

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
		var domain = req.params.domain.split('.');
		_.extend(req.body, {sld: domain[0], tld: domain[1]});
		Domain.setCustomNameServer(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/whois/nameserver/ng/:domain', (req, res, next) => {
		var domain = req.params.domain.split('.');
		// Things to ponder about: ".com.ng" split would fail
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