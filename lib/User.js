var _ = require('underscore');
var UserModel = require('../config/models')().User;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var jwt = require('jwt-simple');
var hat = require('hat');
var secret = require("../config/secret");
var hash = require("sha256");
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
			users = users.dataValues || users;
			resolve(users);
		}).catch(function(err) {
			reject(err);
		});
	});
};

User.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		UserModel.findById(id).then(function(user) {
			user = user.dataValues || user;
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

User.prototype.auth = function(data){
	return new Promise(function(resolve, reject) {
		UserModel.findOne({ where: {
			$or: [{
				email: data.email || '',
				password: hash(data.password) || ''
			},{
				mobileNumber: data.mobileNumber || '',
				password: hash(data.password) || ''
			}],
			userType: {
				$ne: 'virtual',
			}
		}
		}).then(function(user) {
			user = user.dataValues || user;
			user = _.omit(user, ['password']);
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
		userData.password = hash(userData.password);
		if(!_.has(userData, 'uid')){
			userData.uid = hat();
		}
		UserModel.create(userData).then(function(user) {
			user = user.dataValues || user;
			user = _.omit(user, ['password']);
			process.emit("user_created", user);
			resolve(user);
		}).catch(function(err) {
			reject(err);
		});
	});
};

/**
* Generate Access Token
* @method generateAccessToken
* @param user_object {Object} the request object
* @return accessToken {String} Lifetime accessToken
* 
**/

User.prototype.generateAccessToken = function(user_object){

	if (!_.isObject(user_object) || !_.has(user_object, 'id') || 
		!_.has(user_object, 'mobileNumber') ) {
		return undefined;
	}

	var payload = { user: user_object, salt: hat()};
	
	var accessToken = jwt.encode(payload, secret);

	return accessToken;
};

/**
* Convert accessToken to User Object
* @method accessTokenToUserObj
* @param accessToken {String} the accessToken
* @return userObj {Object}
* 
**/

User.prototype.accessTokenToUserObj = function(accessToken){

	if (!_.isString(accessToken)) {
		return null;
	}

	try {
		var userObj = jwt.decode(accessToken, secret);
		return userObj;
	}catch(err){
		return null;
	}

};

module.exports = new User();