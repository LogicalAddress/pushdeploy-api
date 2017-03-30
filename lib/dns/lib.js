var _ = require('underscore');
var Request = require('request');
var util = require('util');
var AppConfig = require('../../config/app');
var NSConfig = require('../../config/dns');
var EventEmitter = require('events').EventEmitter;
var NSError = require('./NSErrors');

/*
*
* @Class NameServer Powered by CargoSpace's atomiadns
**/ 

function NameServer(){

}

util.inherits(NameServer, EventEmitter);
/*
* Return all zone records known by the server
*/
NameServer.prototype.getAllZones = function(){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: NSConfig.NameServer.END_POINT + '/GetAllZones',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: {},
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		
    		if(body){
    			return resolve({
    				status: "success",
    				data: body
    			});		
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

/*
* Return zone info
*/
NameServer.prototype.getZone = function(zone){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: NSConfig.NameServer.END_POINT + '/GetZone',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: [zone],
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		
    		if(body){
    			return resolve({
    				status: "success",
    				data: _.has(body, 'error_type') ? {
    					error: NSError[body.error_type] || "General Error",
    				} : body,
    			});		
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

/*
* Create a new zone info and clone from another zone if possible
* https://atomia.github.io/atomiadns/apidocs.html#method-AddZone
*/
NameServer.prototype.AddZone = function(zone){
	return new Promise(function(resolve, reject) {
		var soa = NSConfig.NameServer.DEFAULT_SOA_VALUES.slice(0);
		soa.unshift(zone.name);
		soa.push(NSConfig.NameServer.DEFAULT_NAMESERVERS);
		soa.push(NSConfig.NameServer.NAMESERVER_GROUP);
		Request.post({
			url: NSConfig.NameServer.END_POINT + '/AddZone',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: soa,
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		
    		if(body){
    			return resolve({
    				status: "success",
    				data: _.has(body, 'error_type') ? {
    					error: NSError[body.error_type] || "General Error",
    				} : body,
    			});		
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

/*
* Return zone info
*/
NameServer.prototype.DeleteZone = function(zone){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: NSConfig.NameServer.END_POINT + '/DeleteZone',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: [zone],
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		
    		if(body){
    			return resolve({
    				status: "success",
    				data: _.has(body, 'error_type') ? {
    					error: NSError[body.error_type] || "General Error",
    				} : body,
    			});		
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

module.exports = new NameServer();