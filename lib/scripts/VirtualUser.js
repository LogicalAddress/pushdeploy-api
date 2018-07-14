var User = require('../User');
var Account = require('../Account');
var AccountCode = require("../../config/AccountCode");
var hat = require("hat");
var uid = '+00000000000';

module.exports = function () {
    User.findOne({uid: uid}).then((user) => {
        if(!user){
            User.create({
                uid: uid,
                userType: 'virtual',
                mobileNumber: "+00000000000",
                email: "virtual@logicaladdress.com",
                password: hat(),
            }).then((user)=>{
                // Silence is golden
            }).catch((err)=>{
                console.log(err);
                console.log("CreatingVirtualUserFailed");
            });    
        }
    }).catch((err)=>{
        console.log(err);
    });
    
    return {
        getNairaAccount: function(){
            return new Promise(function(resolve, reject){
                User.findOne({uid: uid})
                .then((user)=>{
                    Account.findOne({userId: user.id, accountType: AccountCode.NGN}).then((account) => {
                        resolve(account);
                    }).catch((err)=>{
                        reject(err);
                    });
                }).catch((err)=>{
                    reject(err);
                });
                    
            });
        },
        getDollarAccount: function(){
            return new Promise(function(resolve, reject){
                User.findOne({uid: uid})
                .then((user)=>{
                    Account.findOne({userId: user.id, accountType: AccountCode.USD}).then((account) => {
                        resolve(account);
                    }).catch((err)=>{
                        reject(err);
                    });
                }).catch((err)=>{
                    reject(err);
                });
                    
            });
        },
        
        getEuroAccount: function(){
            return new Promise(function(resolve, reject){
                User.findOne({uid: uid})
                .then((user)=>{
                    Account.findOne({userId: user.id, accountType: AccountCode.EUR}).then((account) => {
                        resolve(account);
                    }).catch((err)=>{
                        reject(err);
                    });
                }).catch((err)=>{
                    reject(err);
                });
                    
            });
        },
        
        getPoundAccount: function(){
            return new Promise(function(resolve, reject){
                User.findOne({uid: uid})
                .then((user)=>{
                    Account.findOne({userId: user.id, accountType: AccountCode.GBP}).then((account) => {
                        resolve(account);
                    }).catch((err)=>{
                        reject(err);
                    });
                }).catch((err)=>{
                    reject(err);
                });
                    
            });
        },
        
        getUser: function(){
            return new Promise(function(resolve, reject){
                User.findOne({uid: uid})
                .then((user)=>{
                    resolve(user);
                }).catch((err)=>{
                    reject(err);
                });
            });
        }
    };
};