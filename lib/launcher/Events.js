// jshint ignore: start
var _ = require('underscore');
var EventsModel = require('../../models/Events');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the EventsModel
* @Class Events
* 
**/ 

function Events(){

}

util.inherits(Events, EventEmitter);


Events.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		EventsModel.find().exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Events.prototype.create = function(data){
	return new Promise(function(resolve, reject) {
	    var mEvents = new EventsModel(data);
		mEvents.save().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Events.prototype.findAllByUid = function(uid){
	return new Promise(function(resolve, reject) {
		EventsModel.find({uid: uid}).exec().then(function(response){
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Events.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		EventsModel.findOne(query).exec().then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = new Events();