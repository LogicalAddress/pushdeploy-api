var _ = require('underscore');
var UserDatabaseModel = require('../../models/UserDatabases');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the UserDatabaseModel
* @Class UserDatabase
* 
**/ 

function UserDatabase(){

}

util.inherits(UserDatabase, EventEmitter);

var _findOne = function(query){
	return new Promise((resolve, reject)=>{
		UserDatabaseModel.findOne(query).populate('server').exec().then((response)=>{
			resolve(response);
		}).catch(function(err) {
			reject(null);
		});
	});
};

UserDatabase.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
		if(!_.has(data, 'uid')) return reject("uid missing");
		_findOne({
			server: data.server,
			db_name: data.db_name
		}).then((response)=>{
			if(_.has(response, 'db_name')){
				return reject("an database with that name exists");
			}
			var mUserDatabaseModel = new UserDatabaseModel(data);
			mUserDatabaseModel.save().then(function(response) {
				process.emit("user_database_created", response);
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

UserDatabase.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		UserDatabaseModel.find().populate('server').exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserDatabase.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		UserDatabaseModel.findById(id).populate('server').exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserDatabase.prototype.delete = function(database){
	return new Promise(function(resolve, reject) {
		UserDatabaseModel.remove(database).exec().then(function(response) {
			process.emit("user_database_deleted", database);
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

UserDatabase.prototype.deleteServerDatabases = function(server){
	return new Promise(function(resolve, reject) {
		UserDatabaseModel.remove({server: server._id}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

UserDatabase.prototype.findOne = function(query){
	return _findOne(query);
};

module.exports = new UserDatabase();