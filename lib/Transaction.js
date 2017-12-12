var _ = require('underscore');
var TransactionModel = require('../config/models')().Transaction;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/*
* An interface to the TransactionModel
* @Class Transaction
* 
**/ 

function Transaction(){

}

util.inherits(Transaction, EventEmitter);

Transaction.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		TransactionModel.findAll().then(function(transactions){
			transactions = transactions.get({plain: true});
			resolve(transactions);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Transaction.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		TransactionModel.findById(id).then(function(transaction) {
			transaction = transaction.get({plain: true});
			resolve(transaction);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Transaction.prototype.findByUserId = function(userId){
	return new Promise(function(resolve, reject) {
		TransactionModel.find({userId: userId}).then(function(transactions) {
			transactions = transactions.get({plain: true});
			resolve(transactions);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Transaction.prototype.find = function(query){
	return new Promise(function(resolve, reject) {
		TransactionModel.findAll({ where: query }).then(function(transactions) {
			resolve(transactions);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Transaction.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		TransactionModel.findOne({ where: query }).then(function(transaction) {
			transaction = transaction.get({plain: true});
			resolve(transaction);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Transaction.prototype.create = function(AccountData){
	return new Promise(function(resolve, reject) {
		TransactionModel.create(AccountData).then(function(transaction) {
			transaction = transaction.get({plain: true});
			process.emit("transaction_created", transaction);
			resolve(transaction);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};


module.exports = new Transaction();