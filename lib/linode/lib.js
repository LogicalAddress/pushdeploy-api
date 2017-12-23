var _ = require('underscore');
var Request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var LinodeConf = require("../../config/linode");
var generate = require('project-name-generator');

/*
*
* @Class Linode Powered by Linode.com
* https://developers.linode.com/reference/
**/ 

function Linode(){

}

util.inherits(Linode, EventEmitter);
/*
* Get List of Ubuntu Linux Distributions on Linode
*/
Linode.prototype.distributions = function(){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/linode/distributions',
			headers: {
			    'Accept': 'application/json', 
			    'X-Filter': {
			        "vendor": "Ubuntu",
			     //   "deprecated": "false"
			    },
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
* Get List of Data Centers
*/
/*Linode.prototype.datacenters = function(){
	return new Promise(function(resolve, reject) {
		return resolve({
		    status: "success",
		    data: ['dallas:Dallas, TX','fremont:Fremont, CA','atlanta:Atlanta, GA',
		        'newark:Newark, NJ','london:London, England, UK','singapore:Singapore, SG',
		        'frankfurt:Frankfurt, DE'],
		});
	});
};*/

/*
* Get DataCenters
*/
Linode.prototype.datacenters = function(){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/datacenters',
			headers: {
			    'Accept': 'application/json', 
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
* Get DataCenter Info
*/
Linode.prototype.datacenter = function(payload){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/datacenters/' + payload.datacenter_id,
			headers: {
			    'Accept': 'application/json', 
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
* Get List of Linode Instances
*/
Linode.prototype.instances = function(payload){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/linode/instances',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
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
* Get Info about a Linode
*/
Linode.prototype.instance = function(payload){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/linode/instances/'+payload.linode_id,
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
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
* Create a Linode Instance
*/
Linode.prototype.createInstance = function(payload){
	return new Promise(function(resolve, reject) {
		var realPayload = {
		    'datacenter': payload.datacenter,
		    "type": payload.type || "standard-1",
		    'label': generate({ number: true }).dashed,
		    'distribution': payload.distribution, //an object returned from Linode.prototype.distributions
		    'root_pass': payload.root_pass || generate().dashed,
		 //   'root_ssh_key': '' //A public SSH key file to install at `/root/.ssh/authorized_keys` when creating this Linode. 
		}
		Request.post({
			url: LinodeConf.END_POINT + '/linode/instances',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
			},
			json: realPayload, 
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
* Boot this Linode
*/
Linode.prototype.boot = function(payload){
	return new Promise(function(resolve, reject) {
		Request.post({
			url: LinodeConf.END_POINT + '/linode/instances/' + payload.linode_id + '/boot',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
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
* Boot this Linode
*/
Linode.prototype.shutdown = function(payload){
	return new Promise(function(resolve, reject) {
		Request.post({
			url: LinodeConf.END_POINT + '/linode/instances/' + payload.linode_id + '/shutdown',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
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
* Boot this Linode
*/
Linode.prototype.reboot = function(payload){
	return new Promise(function(resolve, reject) {
		Request.post({
			url: LinodeConf.END_POINT + '/linode/instances/' + payload.linode_id + '/reboot',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
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
* Get Networking Info about this Linode
*/
Linode.prototype.networking = function(payload){
	return new Promise(function(resolve, reject) {
		Request.post({
			url: LinodeConf.END_POINT + '/linode/instances/' + payload.linode_id + '/ips',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
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
* Create DNS Entry on the Linode
*/
Linode.prototype.createZone = function(payload){
	return new Promise(function(resolve, reject) {
		var record = LinodeConf.DEFAULT_SOA_VALUES;
		record.dnszone = payload.domain;
		if(_.isArray(payload.ip)){
			record.master_ips = payload.ip;
		}else{
			record.master_ips.push(payload.ip);
		}
		Request.post({
			url: LinodeConf.END_POINT + '/dns/zones',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
			},
			json: record, 
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
* Create a Zone Record on the zone
*/
function createARecord(payload){
	return new Promise(function(resolve, reject) {
		var record = LinodeConf.DEFAULT_A_VALUES;
		record.target = payload.ip;
		record.name = payload.domain;
		Request.post({
			url: LinodeConf.END_POINT + '/dns/zones/' + payload.dnszone_id + '/records',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
			},
			json: record, 
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
}


/*
* Create a Zone Record on the zone
*/

Linode.prototype.createZoneRecord = function(payload){
	return new Promise(function(resolve, reject) {
		Request.post({
			url: LinodeConf.END_POINT + '/dns/zones/' + payload.dnszone_id + '/records',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
			},
			json: payload.dnsrecord, 
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
* getZone
*/
Linode.prototype.getZone = function(payload){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/dns/zones/' + payload.dnszone_id,
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'token ' + payload.token
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

module.exports = new Linode();