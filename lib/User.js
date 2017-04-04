var _ = require('underscore');
var UserModel = require('../config/models')().User;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the UserModel
* @Class User
* 
**/ 

function User(){

}

util.inherits(User, EventEmitter);

User.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		UserModel.findAll().then(function(users){
			users = users.dataValues;
			resolve(users);
		}).catch(function(err) {
			reject(err);
		});
	});
};

User.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		UserModel.findById(id).then(function(user) {
			user = user.dataValues;
			resolve(user);
		}).catch(function(err) {
			reject(err);
		});
	});
};

User.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		UserModel.destroy(query).then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

User.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		UserModel.findOne({ where: query }).then(function(user) {
			resolve(user);
		}).catch(function(err) {
			reject(err);
		});
	});
};

User.prototype.update = function(data){
	return new Promise(function(resolve, reject) {
		UserModel.update(data.update, { where: data.query }).then(function(user) {
			resolve(user);
		}).catch(function(err) {
			reject(err);
		});
	});
};

User.prototype.create = function(userData){
	return new Promise(function(resolve, reject) {
		UserModel.create(userData).then(function(user) {
			user = user.dataValues;
			process.emit("user_created", user);
			resolve(user);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new User();