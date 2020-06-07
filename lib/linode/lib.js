var _ = require('underscore');
var Request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var LinodeConf = require("../../config/linode");
var AppConfig = require('../../config/app');
var fs = require("fs");
var copts = {
	example_repo: "https://github.com/LogicalAddress/pushdeploy-nodejs-example.git",
	node_version: "8.9.3"
};

/*
*
* @Class Linode Powered by Linode.com
* https://developers.linode.com/reference/
**/ 

function Linode(){

}

util.inherits(Linode, EventEmitter);

Linode.prototype.types = function(){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/linode/types',
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
* Get List of Ubuntu Linux Distributions on Linode
*/
Linode.prototype.images = function(){
	return new Promise(function(resolve, reject) {
		Request.get({
			url: LinodeConf.END_POINT + '/images',
			headers: {
			    'Accept': 'application/json', 
			    'X-Filter': '{"vendor":"Ubuntu"}',
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

Linode.prototype.deleteStackScript = function(req, stackscriptId){
	return new Promise(function(resolve, reject) {
		Request.del({
			url: LinodeConf.END_POINT + '/linode/stackscripts/' + stackscriptId,
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'Bearer ' +  req.body.token
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
}

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
			url: LinodeConf.END_POINT + '/regions',
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
Linode.prototype.createStackScript = function(req){
	
	return new Promise(function(resolve, reject) {
		fs.readFile(__dirname + '/../../cargoshell/cargoshell_ubuntu_16.04.sh', 'utf8', 
			function(err, script) {
			if(err) return reject({status: "failure", message: err});
			console.log("startScriptLink", LinodeConf.END_POINT + '/linode/stackscripts');
			Request.post({
				url: LinodeConf.END_POINT + '/linode/stackscripts',
				headers: {
					'Accept': 'application/json', 
					'Authorization': 'Bearer ' +  req.body.token
				},
				json: {
					"images": [req.body.image],
					"label": "pushdeploy",
					"script": script,
				}, 
			},
			(err, res, body) => {
				if (err) return reject(err);
				console.log({body});
				if(body && body.id){
					return resolve({
						status: "success",
						data: body
					});		
				}else{
					return reject({status: "failure", message: err});
				}
			});
		});
	});
};


/*
* Create a Linode Instance
*/
Linode.prototype.createInstance = function(req, server){
	/*
		req.body
		{ template: 'nodejs',
			template_variation: 'v8.9.3',
			app_repository:
			'git@github.com:LogicalAddress/pushdeploy-nodejs-example.git',
			provider: 'linode',
			image: 'linode/ubuntu16.04lts',
			region: 'us-west',
			type: 'g6-nanode-1',
			token: '8c8c91a0c05c8f05622d56aff782e9877df31482bada656859aeb7482d4a5d49' 
		}
   	*/
	return new Promise(function(resolve, reject) {
		Request.post({
			url: LinodeConf.END_POINT + '/linode/instances',
			headers: {
			    'Accept': 'application/json', 
			    'Authorization': 'Bearer ' +  req.body.token
			},
			json: { 
				'region': req.body.region,
				"type": req.body.type,
				'label': server.server_name,
				'image':  req.body.image, //an object returned from Linode.prototype.images
				'root_pass': server.linode_root_password,
				'stackscript_data': {
					"SERVER_ID": server.id,
					"CALLBACK_TOKEN": req.techpool.user.access_token,
					"CALLBACK_URL": AppConfig.AppDomain + "/v1/server/events",
					"ACTION": "init_with_default_app",
					"APP_NAME": "default",
					"PORT": "3000",
					"TEMPLATE": 'nodejs',
					"NODE_VERSION": copts.node_version,
					"REPOSITORY": copts.example_repo,
					"USERCARGOSPACEPUBKEY": req.techpool.credentials.custom_public_key
				},
				'stackscript_id': parseInt(server.linode_stackscript_id),
			 //   'root_ssh_key': '' //A public SSH key file to install at `/root/.ssh/authorized_keys` when creating this Linode. 
			}, 
		},
		(err, res, body) => {
    		if (err) return reject(err);
    		if(body && !body.errors){
    			return resolve({
    				status: "success",
    				data: body
    			});		
    		}else{
    			return reject({status: "failure", error: body.errors, message: err});
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