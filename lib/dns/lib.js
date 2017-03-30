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
    			if(zone.copyFrom.length > 0){
    				process.emit("cloneZone", zone.name, zone.copyFrom);
    			}
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
* Delete zone 
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

/*
* Export zone info
*/	
NameServer.prototype.GetZoneBinary = function(zone){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: NSConfig.NameServer.END_POINT + '/GetZoneBinary',
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
* Import zone info
*/	
NameServer.prototype.RestoreZoneBinary = function(payload){
	return new Promise(function(resolve, reject) {
		var records = [
            payload.name, 
            NSConfig.NameServer.NAMESERVER_GROUP,
            payload.zone.replace(/\r/g, '') 
		];
		Request.post({
			url: NSConfig.NameServer.END_POINT + '/RestoreZoneBinary',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: records,
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
* Delete only one DNS record from a zone (not bulk)
*/
NameServer.prototype.DeleteDnsRecord = function(payload){
	return new Promise(function(resolve, reject) {
		// See https://atomia.github.io/atomiadns/apidocs.html#method-DeleteDnsRecords (the rest are dump data, only id is required)
		var records = [ payload.name, [ { id: payload.id, class: 'IN', type: 'A', 
		ttl: 3600, rdata: '127.0.0.1', label: 'foo' } ]];
		Request.get({
			url: NSConfig.NameServer.END_POINT + '/DeleteDnsRecords',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: records,
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
* Edit only one DNS record from a zone (not bulk)
*/
NameServer.prototype.EditDnsRecord = function(payload){
	return new Promise(function(resolve, reject) {
		console.log([ payload.name, payload.entries]);
		Request.post({
			url: NSConfig.NameServer.END_POINT + '/EditDnsRecords',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: [ payload.name, payload.entries ],
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