// jshint ignore: start
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var AppDeployLogsModel = require('../../models/AppDeployLogs');
/*
* An interface to the AppDeployLogsModel
* @Class AppDeployLog
* 
**/ 

function AppDeployLog(){

}

util.inherits(AppDeployLog, EventEmitter);

AppDeployLog.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		AppDeployLogsModel.find().populate('server').populate('app').exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

AppDeployLog.prototype.findAllByUID = function(uid){
	return new Promise(function(resolve, reject) {
		AppDeployLogsModel.find({uid: uid }).populate('server')
			.populate('app').exec().then(function(records) {
			resolve(records);
		}).catch(function(err) {
			reject(err);
		});
	});
};

AppDeployLog.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
	if(!_.has(data, 'uid')) return reject("uid missing");
		let mApplogs = new AppDeployLogsModel(data);
		mApplogs.save().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};


AppDeployLog.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		AppDeployLogsModel.remove(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new AppDeployLog();