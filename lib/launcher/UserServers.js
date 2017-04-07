var _ = require('underscore');
var UserServerModel = require('../../models/mongo/UserServers');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the UserServerModel
* @Class UserServer
* 
**/ 

function UserServer(){

}

util.inherits(UserServer, EventEmitter);


UserServer.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
		if(!_.has(data, 'uid')) return reject("uid missing");
	    var mUserServerModel = new UserServerModel(data);
		mUserServerModel.save().then(function(response) {
			process.emit("user_server_created", response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserServer.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		UserServerModel.find().exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserServer.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		UserServerModel.findById(id).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserServer.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		UserServerModel.remove(query).exec().then(function(response) {
			resolve(response);
			process.emit("user_server_deleted", response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserServer.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		UserServerModel.findOne(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new UserServer();