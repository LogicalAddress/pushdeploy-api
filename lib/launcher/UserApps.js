var _ = require('underscore');
var UserAppModel = require('../../models/UserApps');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the UserAppModel
* @Class UserApp
* 
**/ 

function UserApp(){

}

util.inherits(UserApp, EventEmitter);

var _findOne = function(query){
	return new Promise((resolve, reject)=>{
		UserAppModel.findOne(query).populate('server').exec().then((response)=>{
			resolve(response);
		}).catch(function(err) {
			reject(null);
		});
	});
};

UserApp.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
		if(!_.has(data, 'uid')) return reject("uid missing");
		_findOne({
			server: data.server,
			app_name: data.app_name
		}).then((response)=>{
			if(_.has(response, 'app_name')){
				return reject("an app with that name exists");
			}
			var mUserAppModel = new UserAppModel(data);
			mUserAppModel.save().then(function(response) {
				process.emit("user_app_created", response);
				resolve(response);
				return null;
			}).catch(function(err) {
				reject(err);
			});
		}).catch((err)=>{
			reject("Error occurs");
		});
		    
	});
};

UserApp.prototype.findAllBy = function(query){
	return new Promise(function(resolve, reject) {
		UserAppModel.find(query).populate('server').exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserApp.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		UserAppModel.find().populate('server').exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserApp.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		UserAppModel.findById(id).populate('server').exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserApp.prototype.delete = function(app){
	return new Promise(function(resolve, reject) {
		UserAppModel.remove(app).exec().then(function(response) {
			process.emit("user_app_deleted", app);
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserApp.prototype.updateOne = async function(query, update) {
	return new Promise(function(resolve, reject) {
		UserAppModel.findOneAndUpdate(query, update, { new: true })
			.exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserApp.prototype.deleteServerApps = function(server){
	return new Promise(function(resolve, reject) {
		UserAppModel.remove({server: server._id}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

UserApp.prototype.findOne = function(query){
	return _findOne(query);
};

module.exports = new UserApp();