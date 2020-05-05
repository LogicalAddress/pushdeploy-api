// jshint ignore: start
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var UserAuthCredentialModel = require('../../models/UserAuthCredentials');
/*
* An interface to the UserAuthCredentialModel
* @Class UserAuthCredential
* 
**/ 

function UserAuthCredential(){

}

util.inherits(UserAuthCredential, EventEmitter);

UserAuthCredential.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		UserAuthCredentialModel.find().exec().then(function(users){
			users = users.dataValues || users;
			resolve(users);
		}).catch(function(err) {
			reject(err);
		});
	});
};


UserAuthCredential.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		UserAuthCredentialModel.remove(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserAuthCredential.prototype.findByUID = function(uid){
	return new Promise(function(resolve, reject) {
		UserAuthCredentialModel.findOne({uid: uid }).select(["-custom_private_key", "-db_root_password",
		"-github_token", "-aws_secret_key","-aws_KeyFingerprint", "-aws_KeyMaterial",
	"-aws_KeyName", "-aws_SecurityGroupId", "-bitbucket_token", "-bitbucket_refresh_token",
	"-digitalocean_token", "-digitalocean_refresh_token","-linode_token", "-linode_refresh_token"]).exec().then(function(userCredential) {
			resolve(userCredential);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserAuthCredential.prototype._findByUID = function(uid){
	//internal use - exposes all the fields
	return new Promise(function(resolve, reject) {
		UserAuthCredentialModel.findOne({uid: uid }).exec().then(function(userCredential) {
			resolve(userCredential);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserAuthCredential.prototype.update = function(data){
	return new Promise(function(resolve, reject) {
		data.update = Object.assign(data.update, data.query);
		UserAuthCredentialModel.findOneAndUpdate(data.query, data.update, {new : true, upsert: true }).exec().then(function(userCredential) {
			console.log("INDEBUG", userCredential);
			resolve(userCredential);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserAuthCredential.prototype.upsert = function(data){
	return new Promise(function(resolve, reject) {
		UserAuthCredentialModel.update(data, data, {upsert : true }).exec().then(function(userCredential) {
			resolve(userCredential);
		}).catch(function(err) {
			reject(err);
		});
	});
};


module.exports = new UserAuthCredential();