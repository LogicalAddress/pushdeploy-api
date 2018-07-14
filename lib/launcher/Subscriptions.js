var _ = require('underscore');
var SubscriptionsModel = require('../../models/Subscriptions');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the SubscriptionsModel
* @Class Subscription
* 
**/ 

function Subscription(){

}

util.inherits(Subscription, EventEmitter);


Subscription.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
		if(!_.has(data, 'uid')) return reject("uid missing");
	    var msubModel = new SubscriptionsModel(data);
		msubModel.save().then(function(response) {
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

Subscription.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		SubscriptionsModel.find().exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Subscription.prototype.findAllByUid = function(uid){
	return new Promise(function(resolve, reject) {
		SubscriptionsModel.find({uid: uid}).exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Subscription.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		SubscriptionsModel.findById(id).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Subscription.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		SubscriptionsModel.remove(query).exec().then(function(response) {
			resolve(response);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};

Subscription.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		SubscriptionsModel.findOne(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new Subscription();