var _ = require('underscore');
var Request = require('request');
var util = require('util');
var AppConfig = require('../../config/app');
var WhoisConfig = require('../../config/whois');
var EventEmitter = require('events').EventEmitter;
var XML2JSON = require('xml2json');

/*
*
* @Class Domain Powered by ENOM
* https://www.enom.com/api/Domains%20Topics/Selling%20and%20Managing%20Domains.htm
**/ 

function Domain(){

}

util.inherits(Domain, EventEmitter);
/*
* Search for the availability of domain names
*/
Domain.prototype.search = function(domain){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: WhoisConfig.enom.END_POINT + '&command=check&sld='+domain.sld+'&tld='+domain.tld,
			headers: { 'Accept': 'application/json', },
			json: {}, 
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		body = JSON.parse(XML2JSON.toJson(body));
    		if(body){
    			body = body['interface-response'];
    			return resolve({
    				status: "success",
    				data: {
    					DomainName: body.DomainName,
    					message: body.RRPText,
    					provider: body.Site,
    					IsLockable: body.IsLockable,
    					IsRealTimeTLD: body.IsRealTimeTLD,
    				}
    			});		
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};
/*
* Retrieve a list of the name servers associated with a domain name
*/
Domain.prototype.getCurrentNameServers = function(domain){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: WhoisConfig.enom.END_POINT + '&command=GetDNS&sld='+domain.sld+'&tld='+domain.tld,
			headers: { 
				'Accept': 'application/json', 
			},
			json: {}, 
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		body = JSON.parse(XML2JSON.toJson(body));
    		if(body){
    			body = body['interface-response'];
    			var result = {
    				status: "success",
    				data: {
    					DomainName: domain.sld + "." + domain.tld,
    					dns: body.RRPCodeGDNS == 200 ? body.dns : [],
    					provider: body.Site,
    					message: body.RRPText,
    					IsLockable: body.IsLockable,
    					IsRealTimeTLD: body.IsRealTimeTLD,
    				}
    			};
    			if(body.RRPCodeGDNS != 200){
    				result.data.provider = null;
    				if(body.ErrCount > 0 && body.errors){
    					result.data.error = body.errors.Err1 || null;	
    				}
    			}
    			
    			return resolve(result);
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

/*
*  	Retrieve the current universal settings for this account.
*/

Domain.prototype.getDefaultConfigs = function(){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: WhoisConfig.enom.END_POINT + '&command=GetCusPreferences',
			headers: { 'Accept': 'application/json', },
			json: {}, 
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		body = JSON.parse(XML2JSON.toJson(body));
    		if(body){
    			body = body['interface-response'];
    			var preference = body.CustomerPrefs;
    			console.log(body);
    			var result = {
    				status: "success",
    				data: {
    					NameServers: [],
    					hostrecord: [],
    					provider: body.Site,
    				}
    			};
    			if(_.has(preference, 'NameServers')){
    				for (var key in preference.NameServers) {
    					result.data.NameServers.push(preference.NameServers[key]);
    				}
    			}
    			if(_.has(preference, 'defaulthostrecords') && _.has(preference.defaulthostrecords, 'hostrecord') &&
    			_.isArray(preference.defaulthostrecords.hostrecord)){
    				result.data.hostrecord = preference.defaulthostrecords.hostrecord;
    			}
    			return resolve(result);
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

/*
* Set name servers for a domain name, both in our system and at the Registry. 
* If you don’t specify universal settings through our Web site or the UpdateCusPreferences command, 
* ModifyNS is a basic configuration command for each new domain you register
* Tobe fired on successful purchase of a domain name.
*/

Domain.prototype.useDefaultNameServer = function(domain){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: WhoisConfig.enom.END_POINT + '&command=ModifyNS&sld='+domain.sld+'&usedns=default&tld='+domain.tld,
			headers: { 'Accept': 'application/json', },
			json: {}, 
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		body = JSON.parse(XML2JSON.toJson(body));
    		if(body){
    			return resolve(body);		
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

/*
*
* UpdateCusPreferences is the API command that supports the universal settings in Task 3 above. 
* If you set name servers at the account level, 
* those name servers are applied to every domain name at the time of registration.
*/

Domain.prototype.updateNameServer = function(payload){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: WhoisConfig.enom.END_POINT + '&command=ModifyNS&sld='+payload.sld+'&usedns=default&tld='+payload.tld,
			headers: { 'Accept': 'application/json', },
			json: {}, 
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		body = JSON.parse(XML2JSON.toJson(body));
    		if(body){
    			return resolve(body);		
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

module.exports = new Domain();