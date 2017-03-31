var _ = require("underscore");
var AccountCode = require("../../config/AccountCode");

function AppLib(){

}

/*
* Return a random short code to be used (10 digit code) + Prefix Inclusive
*/
AppLib.prototype.generateNairaAccountNumber = function(){
    return new Promise(function(resolve, reject){
        resolve(AccountCode.NGN + _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 7).join(''));
    });
};

/*
* Return a random short code to be used (10 digit code) + Prefix Inclusive
*/
AppLib.prototype.generateDollarAccountNumber = function(){
    return new Promise(function(resolve, reject){
        resolve(AccountCode.USD + _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 7).join(''));
    });
};

/*
* Return a random short code to be used (10 digit code) + Prefix Inclusive
*/
AppLib.prototype.generateEuroAccountNumber = function(){
    return new Promise(function(resolve, reject){
        resolve(AccountCode.EUR + _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 7).join(''));
    });
};

/*
* Return a random short code to be used (10 digit code) + Prefix Inclusive
*/
AppLib.prototype.generatePoundAccountNumber = function(){
    return new Promise(function(resolve, reject){
        resolve(AccountCode.GBP + _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 7).join(''));
    });
};

AppLib.prototype.generateTransactionRef = function(){
    return new Promise(function(resolve, reject){
        resolve(_.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12).join(''));
    });
};

AppLib.prototype.randomNumber = function(){
    return _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12).join('');
};

module.exports = new AppLib();