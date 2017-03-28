var _ = require('underscore');
var Request = require('request');
var util = require('util');
var AppConfig = require('../../config/app');
var WhoisConfig = require('../../config/whois');
var EventEmitter = require('events').EventEmitter;

/*
*
* @Class Domain Powered by ENOM
* https://www.enom.com/api/Domains%20Topics/Selling%20and%20Managing%20Domains.htm
**/ 

function Domain(){

}

util.inherits(Domain, EventEmitter);

Domain.prototype.search = function(payload){
	return new Promise(function(resolve, reject) {
		Request.post({
			url: WhoisConfig.enom.END_POINT + '&command=check&sld='+payload.sld+'&tld='+payload.tld,
			headers: { 'Accept': 'application/json', },
			json: {}, 
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		if(body){
    			return resolve(body);		
    		}else{
    			return reject(body);
    		}
		});
	});
};


module.exports = new Domain();