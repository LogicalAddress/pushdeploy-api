var _ = require('underscore');
var Request = require('request');
var util = require('util');
// var AppConfig = require('../../config/app');
var NSConfig = require('../../config/dns');
var EventEmitter = require('events').EventEmitter;
var NSError = require('./NSErrors');

/*
*
* @Class NameServer Powered by CargoSpace's atomiadns
* https://www.ietf.org/rfc/rfc1035.txt
**/ 

function NameServer(){

}

util.inherits(NameServer, EventEmitter);

/*
* Get Preconfigure nameservers
*/
NameServer.prototype.nameservers = function(){
	return new Promise(function(resolve, reject) {
		resolve(NSConfig.NameServer.DEFAULT_NAMESERVERS); //array of NS
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
				console.log("_getZone", body);
    			if(body.error_type){
					return reject(body);
				}else{
					return resolve(body)
				}	
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
				console.log("_AddZone", body);
				if(body.error_type){
					console.log("_AddZone", "REQ", soa);
					return reject(body);
				}else{
					return resolve(body)
				}	
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
				console.log("_DeleteZone", body);
    			if(body.error_type){
					return reject(body);
				}else{
					return resolve(body)
				}		
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
		var records = [ payload.name, [ { id: payload.id, 'class': payload.class, type: payload.type, 
		ttl: payload.ttl, rdata: payload.rdata, label: payload.label } ]];
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
				console.log("_DeleteDnsRecord", body);
    			if(body.error_type){
					console.log("_DeleteDnsRecord", "REQ", records);
					return reject(body);
				}else{
					return resolve(body);
				}	
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};

/*
* Add only one DNS record from a zone (not bulk)
*/
NameServer.prototype.AddDnsRecord = function(payload, zoneMeta){
	return new Promise(function(resolve, reject) {
		Request.post({
			url: NSConfig.NameServer.END_POINT + '/AddDnsRecords',
			headers: {
				'Accept': 'application/json', 
				'X-Auth-Username': NSConfig.NameServer.ADMIN_USER, 
				'X-Auth-Password': NSConfig.NameServer.ADMIN_PASS, 
			},
			json: [ zoneMeta.name, payload.entries ],
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		
    		if(body){
				console.log("_AddDnsRecord", body);
    			if(body.error_type){
					console.log("_AddDnsRecord", "REQ", [ zoneMeta.name, payload.entries ]);
					return reject(body);
				}else{
					return resolve({
						id: body[0] || null,
					})
				}	
    		}else{
    			return reject({status: "failure"});
    		}
		});
	});
};
module.exports = new NameServer();