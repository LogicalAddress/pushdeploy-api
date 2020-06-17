// jshint ignore: start
var _ = require('underscore');
var DNSModel = require('../../models/DNS');
var DNSRecordsModel = require('../../models/DNSRecords');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the DNSModel
* @Class DNS
* 
**/ 

function DNS(){

}

util.inherits(DNS, EventEmitter);

DNS.prototype.createZone = function(data){
	return new Promise(function(resolve, reject) {
		if(!_.has(data, 'uid')) return reject("uid missing");
		DNSModel.findOne({
			uid: data.uid,
			name: data.name
		}).then((response)=>{
			if(response && response.name){
				return reject("Zone record with that name exists");
			}
			var mModel = new DNSModel(data);
			mModel.save().then(function(response) {
				return resolve(response);
			}).catch(function(err) {
				return reject(err);
			});
		}).catch((err)=>{
			reject("Error occurs");
		});
		    
	});
};

DNS.prototype.findAllZone = function(queryParams){
	return new Promise(function(resolve, reject) {
		DNSModel.find(queryParams).populate('app').exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

DNS.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		DNSModel.findById(id).populate('app').exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

DNS.prototype.deleteZone = function(zone){
	return new Promise(function(resolve, reject) {
		DNSModel.remove(zone).exec().then(function(response) {
			return resolve(response);
		}).catch(function(err) {
			return reject(err);
		});
	});
};

// When deleting the app, to be called in listener
DNS.prototype.deleteZoneByApp = function(app){
	return new Promise(function(resolve, reject) {
		DNSModel.remove({app: app._id}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

DNS.prototype.findOneZone = function(query){
	return new Promise((resolve, reject)=>{
		DNSModel.findOne(query).populate('app').exec().then((response)=>{
			resolve(response);
		}).catch(function(err) {
			reject(null);
		});
	});
};


DNS.prototype.findAllDNSRecords = function(queryParams){
	return new Promise(function(resolve, reject) {
		DNSRecordsModel.find(queryParams).populate('zone').exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};


DNS.prototype.createDNSRecord = function(data){
	return new Promise(function(resolve, reject) {
		// DNSRecordsModel.findOne({
		// 	uid: data.uid,
		// 	zone: data.zone,
		// 	type: data.type,
		// 	class: data.class,
		// 	name: data.name,
		// 	label: data.label,
		// }).then((response)=>{
		// 	if(response && response.name){
		// 		return reject("DNS record with that name exists");
		// 	}
			let mModel = new DNSRecordsModel(data);
			mModel.save().then(function(response) {
				return resolve(response);
			}).catch(function(err) {
				return reject(err);
			});
		// }).catch((error)=>{
		// 	reject(error);
		// })
	});
};

DNS.prototype.findOneDNSRecord = function(query){
	return new Promise((resolve, reject)=>{
		DNSRecordsModel.findOne(query).populate('zone').exec().then((response)=>{
			resolve(response);
		}).catch(function(err) {
			reject(null);
		});
	});
};

DNS.prototype.deleteDNSRecord = function(zone){
	return new Promise(function(resolve, reject) {
		DNSRecordsModel.remove(zone).exec().then(function(response) {
			return resolve(response);
		}).catch(function(err) {
			return reject(err);
		});
	});
};

module.exports = new DNS();