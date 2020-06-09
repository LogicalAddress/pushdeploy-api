var _ = require('underscore');
var ActivationModel = require('../models/Activations');
/*
* An interface to the ActivationModel
* @Class Activation
* 
**/ 

function Activation(){

}

Activation.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		ActivationModel.remove(query).exec().then(function(response) {
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};


Activation.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		ActivationModel.findOne(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};


Activation.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
		var a = new ActivationModel(data);
		return a.save().then(function(data) {
			resolve(data);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new Activation();