var _ = require('underscore');
var UserAppModel = require('../../models/mongo/UserApps');
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


UserApp.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
		if(!_.has(data, 'uid')) return reject("uid missing");
		this.findOne({
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

UserApp.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		UserAppModel.remove(query).exec().then(function(response) {
			process.emit("user_app_deleted", response);
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserApp.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		UserAppModel.findOne(query).populate('server').exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new UserApp();