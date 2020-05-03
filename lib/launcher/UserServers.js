// jshint ignore: start
var _ = require('underscore');
var UserServerModel = require('../../models/UserServers');
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
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserServer.prototype.removeApp = function(app){
	return new Promise((resolve, reject)=>{
		UserServerModel.update(
		{
			_id: app.server 
		},
		{ $pullAll: { apps: [app] } }).exec().then((res)=>{
			resolve(res);
		}).catch((err)=>{
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

UserServer.prototype.findAllByUid = function(uid){
	return new Promise(function(resolve, reject) {
		UserServerModel.find({uid: uid}).populate('apps').exec().then(function(response){
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
			process.emit("user_server_deleted", response);
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserServer.prototype.deleteServer = function(server){
	return new Promise(function(resolve, reject) {
		UserServerModel.remove({_id: server._id}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
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

UserServer.prototype.appplusplus = function(app){
	return new Promise(function(resolve, reject) {
		UserServerModel.findOneAndUpdate({_id: app.server}, {$inc: {_app_counter:1}}, {
			new: true,
			upsert: false,
		}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

// UserServer.prototype.addApp = function(app){
// 	return new Promise(function(resolve, reject) {
// 		UserServerModel.findOneAndUpdate({_id: app.server}, {$push: {apps:app}}, {
// 			new: true,
// 			upsert: false,
// 		}, (err, response)=>{
// 			if(err){
// 				return reject(err);
// 			}
// 			return resolve(response);
// 		});
// 	});
// };

UserServer.prototype.addApp = function(app){
	return new Promise((resolve, reject)=>{
		UserServerModel.update(
		{
			_id: app.server 
		},
		{ $push: { apps: app } }, {
			new: true,
			upsert: false,
		}).exec().then((res)=>{
			resolve(res);
		}).catch((err)=>{
			reject(err);
		});
	});
};

UserServer.prototype.appminusminus = function(app){
	return new Promise(function(resolve, reject) {
		UserServerModel.findOneAndUpdate({_id: app.server}, {$inc: {_app_counter:-1}}, {
			new: true,
			upsert: false,
		}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

module.exports = new UserServer();