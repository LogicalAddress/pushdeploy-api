var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var namecheapApi = require("namecheap-api");

namecheapApi.config.set("ApiUser", "cargospacec");
// namecheapApi.config.set("ApiKey", "cargospacec");

/*
*
* @Class Domain Powered by NameCheap
* https://www.namecheap.com/support/api/intro.aspx
* https://github.com/alastairparagas/NamecheapAPI
**/ 

function Domain(){

}

util.inherits(Domain, EventEmitter);
/*
* Search for the availability of domain names
*/
Domain.prototype.search = function(domain){
	return new Promise(function(resolve, reject) {
		namecheapApi.apiCall("namecheap.domains.check", {DomainList: domain.sld + "." + domain.tld}, true).then(function (data) {
		    return resolve(data.response);
		}).catch(function (data) {
		    return reject(data.response);
		});
	});
};

module.exports = new Domain();