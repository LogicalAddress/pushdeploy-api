// jshint ignore: start
var _ = require('underscore');
var PaymentsModel = require('../../models/Payments');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the PaymentsModel
* @Class Payments
* 
**/ 

function Payments(){

}

util.inherits(Payments, EventEmitter);


Payments.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		PaymentsModel.find().exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Payments.prototype.findAllByUid = function(uid){
	return new Promise(function(resolve, reject) {
		PaymentsModel.find({uid: uid}).exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Payments.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		PaymentsModel.findById(id).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Payments.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		PaymentsModel.remove(query).exec().then(function(response) {
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

Payments.prototype.upsert = function(data){
	return new Promise(function(resolve, reject) {
		data.update = Object.assign(data.update, data.query);
		PaymentsModel.findOneAndUpdate(data.query, data.update, {new : true, upsert: true }).exec().then(function(record) {
			resolve(record);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Payments.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		PaymentsModel.findOne(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new Payments();