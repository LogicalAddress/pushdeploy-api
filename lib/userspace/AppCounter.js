var _ = require('underscore');
var AppCounterModel = require('../../models/mongo/AppCounter');
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

UserApp.prototype.findOrCreate = function(server_id){
	return new Promise(function(resolve, reject) {
		AppCounterModel.findByIdAndUpdate(server_id, {$inc: {count:1}}, {
			upsert: true,
			setDefaultsOnInsert: true,
		}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

module.exports = new UserApp();