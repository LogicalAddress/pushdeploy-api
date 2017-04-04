var _ = require('underscore');
var AppCounterModel = require('../../models/mongo/AppCounter');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the UserAppModel
* @Class UserApp
* 
**/ 

function AppCounter(){

}

util.inherits(AppCounter, EventEmitter);


AppCounter.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
	    var mAppCounterModel = new AppCounterModel(data);
		mAppCounterModel.save().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

AppCounter.prototype.findOrCreate = function(server){
	return new Promise(function(resolve, reject) {
		AppCounterModel.findOneAndUpdate({server: server._id}, {$inc: {count:1}}, {
			new: true,
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

module.exports = new AppCounter();