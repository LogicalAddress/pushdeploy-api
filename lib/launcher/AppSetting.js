// jshint ignore: start
var _ = require('underscore');
var AppSettingModel = require('../../models/AppSetting');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the UserAppModel
* @Class UserApp
* 
**/ 

function AppSetting(){

}

util.inherits(AppSetting, EventEmitter);

AppSetting.prototype.findOne = function(server){
	return new Promise(function(resolve, reject) {
		AppSettingModel.findOne({}, (err, response)=>{
			if(err){
				return reject(err);
			}
			return resolve(response);
		});
	});
};

module.exports = new AppSetting();