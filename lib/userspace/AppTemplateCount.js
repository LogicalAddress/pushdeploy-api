var _ = require('underscore');
var AppTemplateCountModel = require('../../models/mongo/AppTemplateCount');
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

UserApp.prototype.findOrCreate = function(data){
	/*return new Promise(function(resolve, reject) {
		AppTemplateCountModel.findById(id).populate('server').exec().then(function(response) {
		AppTemplateCountModel.findOneAndUpdate(data, [doc], {upsert: true,setDefaultsOnInsert: true}, [callback])
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});*/
};

module.exports = new UserApp();