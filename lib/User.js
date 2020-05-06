var _ = require('underscore');
var UserModel = require('../models/User');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var jwt = require('jwt-simple');
var hat = require('hat');
var secret = require("../config/secret")();
var hash = require("sha256");
/*
* An interface to the UserModel
* @Class User
* 
**/ 

function User(){

}

util.inherits(User, EventEmitter);


User.prototype.update = function(data){
	return new Promise(function(resolve, reject) {
		UserModel.findOneAndUpdate(data.query, data.update, {
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

User.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		UserModel.find().exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};


User.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		UserModel.findById(id).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};


User.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		UserModel.remove(query).exec().then(function(response) {
			process.emit("user_deleted", response.result);
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};


User.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		UserModel.findOne(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

User.prototype.auth = function(data){
	return new Promise(function(resolve, reject) {
		UserModel.findOne({
				email: data.email || '',
				password: hash(data.password) || ''
			}).then(function(user) {
			user = user.toJSON();
			console.log("DEBUG", user);
			if(!user) return reject({error: "Invalid login credentials"});
			user = _.omit(user, ['password']);
			resolve(user);
		}).catch(function(err) {
			return reject(err);
		});
	});
};


User.prototype.create = function(userData){
	return new Promise(function(resolve, reject) {
		userData.password = hash(userData.password);
		userData.uid = hat();
		userData.userType = 'customer';
		var mUserModel = new UserModel(userData);
		return mUserModel.save().then(function(user) {
			process.emit("user_created", user);
			user = user.toJSON();
			user = _.omit(user, ['password']);
			resolve(user);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

/**
* Generate Access Token
* @method generateAccessToken
* @param object {Object} the request object
* @return accessToken {String} Lifetime accessToken
* 
**/

User.prototype.object2Token = function(object){
	var payload = { user: object, salt: hat()};
	var accessToken = jwt.encode(payload, secret);
	console.log(accessToken);
	return accessToken;
};

/**
* Convert accessToken to User Object
* @method accessTokenToUserObj
* @param accessToken {String} the accessToken
* @return userObj {Object}
* 
**/

User.prototype.token2Object = function(accessToken){
	try {
		var userObj = jwt.decode(accessToken, secret);
		return userObj;
	}catch(err){
		return null;
	}
};

module.exports = new User();