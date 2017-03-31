var AppLib = require('../../lib/account/helper');
var AccountCode = require("../../config/AccountCode");

module.exports = function (context, DataTypes) {
    var Account = context.define('account', {
        id: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
              model: 'users', // Can be both a string representing the table name, or a reference to the model
              key:   "id"
            }
        },
        accountType: {
            type: DataTypes.STRING,
        },
        accountNumber: {
            type: DataTypes.STRING,
            unique: true  
        },
        previousBalance: {
            type: DataTypes.BIGINT(20),
        },
        currentBalance: {
            type: DataTypes.BIGINT(20),
        },
    }, {
        paranoid: true, // Allow Cascade Delete
    });
    Account.beforeCreate(function(account, options) {
        if(account.accountType == AccountCode.NGN){
            return AppLib.generateNairaAccountNumber().then(function (accountNumber) {
                account.accountNumber = accountNumber;
            });
        }else if(account.accountType == AccountCode.USD){
            return AppLib.generateDollarAccountNumber().then(function (accountNumber) {
                account.accountNumber = accountNumber;
            });
        }else if(account.accountType == AccountCode.GBP){
            return AppLib.generatePoundAccountNumber().then(function (accountNumber) {
                account.accountNumber = accountNumber;
            });
        }else if(account.accountType == AccountCode.EUR){
            return AppLib.generateEuroAccountNumber().then(function (accountNumber) {
                account.accountNumber = accountNumber;
            });
        }else{
            if(account.accountNumber) return; //support for other currencies
            throw new Error("Invalid AccountType");
        }
    });
    return Account;
};