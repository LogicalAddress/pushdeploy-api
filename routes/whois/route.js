var Domain = require('../../lib/whois/enom.js');

	/*
	* Whois Search (Using Enom)
	*/
	
	
module.exports = function (app) {
    
    app.get('/v1/whois/search/:domain', (req, res, next) => {
		var domain = req.params.domain.split('.');
		Domain.search({sld: domain[0], tld: domain[1] || 'com'}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
    app.get('/v1/whois/search/all/:sld/:tld', (req, res, next) => {
    	Domain.search({sld: req.params.sld, tld: req.params.tld}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/whois/search/com/:sld', (req, res, next) => {
		var domain = req.params.sld.split('.');
		Domain.search({sld: domain[0], tld: 'com'}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/whois/search/org/:sld', (req, res, next) => {
		var domain = req.params.sld.split('.');
		Domain.search({sld: domain[0], tld: 'org'}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/whois/search/net/:sld', (req, res, next) => {
		var domain = req.params.sld.split('.');
		Domain.search({sld: domain[0], tld: 'net'}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/whois/search/ng/:sld', (req, res, next) => {
		res.status(200).json({message: "Not Implemented"});
	});
	
};