var _ = require("underscore");
var AccountCode = require("../config/AccountCode");

function AppLib(){

}

/*
* Return a random short code to be used (10 digit code) + Prefix Inclusive
*/
AppLib.prototype.generatePrimaryAccountNumber = function(){
    return new Promise(function(resolve, reject){
        resolve(AccountCode.PRIMARY + _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 7).join(''));
    });
};

/*
* Return a random short code to be used (10 digit code) + Prefix Inclusive
*/
AppLib.prototype.generateCouponAccountNumber = function(){
    return new Promise(function(resolve, reject){
        resolve(AccountCode.COUPON + _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 7).join(''));
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