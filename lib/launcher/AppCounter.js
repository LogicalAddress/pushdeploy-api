var _ = require('underscore');
var AppCounterModel = require('../../models/AppCounter');
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

AppCounter.prototype.incrementAppCounter = function(app){
	return new Promise(function(resolve, reject) {
		AppCounterModel.findOneAndUpdate({server: app.server}, {$inc: {count:1}}, {
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

AppCounter.prototype.deleteServer = function(server){
	return new Promise(function(resolve, reject) {
		AppCounterModel.remove({server: server._id}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

module.exports = new AppCounter();