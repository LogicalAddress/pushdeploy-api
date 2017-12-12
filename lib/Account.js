var _ = require('underscore');
var AccountModel = require('../config/models')().Account;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
/*
* An interface to the AccountModel
* @Class Account
* 
**/ 

function Account(){

}

util.inherits(Account, EventEmitter);

Account.prototype.findAll = function(){
	return new Promise(function(resolve, reject) {
		AccountModel.findAll().then(function(accounts){
			accounts = accounts.get({plain: true});
			resolve(accounts);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Account.prototype.findById = function(id){
	return new Promise(function(resolve, reject) {
		AccountModel.findById(id).then(function(account) {
			account = account.get({plain: true});
			resolve(account);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Account.prototype.delete = function(query){
	return new Promise(function(resolve, reject) {
		AccountModel.destroy(query).then(function(response) {
			resolve(response);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Account.prototype.findOne = function(query){
	return new Promise(function(resolve, reject) {
		AccountModel.findOne({ where: query, include: [{ all: true}] }).then(function(account) {
			resolve(account);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Account.prototype.find = function(query){
	return new Promise(function(resolve, reject) {
		AccountModel.findAll({ where: query }).then(function(account) {
			resolve(account);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Account.prototype.create = function(AccountData){
	return new Promise(function(resolve, reject) {
		AccountModel.create(AccountData).then(function(account) {
			account = account.get({plain: true});
			process.emit("account_created", account);
			resolve(account);
			return null;
		}).catch(function(err) {
			reject(err);
		});
	});
};


Account.prototype.fundAccount = function(data){
	var context = this;
	return new Promise((resolve, reject)=>{
		context.findOne({accountNumber: data.toAccount}).then((targetAccount)=>{
			context.findOne({accountNumber: data.fromAccount}).then((sourceAccount)=>{
				sourceAccount.previousBalance = sourceAccount.currentBalance;
				sourceAccount.currentBalance -= parseInt(data.amount);
				sourceAccount.save();
				targetAccount.previousBalance = targetAccount.currentBalance;
				targetAccount.currentBalance += parseInt(data.amount);
				targetAccount.save();
				process.emit("fundAccount", data);
				resolve(true);
				return null;
			}).catch(function(err) {
				reject("Source Account Number Not Found");
			});
		}).catch(function(err) {
			reject("Target Account Number Not Found");
		});
	});
};


module.exports = new Account();