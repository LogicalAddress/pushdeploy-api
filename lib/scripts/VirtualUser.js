var User = require('../User');
var Account = require('../Account');
var AccountCode = require("../../config/AccountCode");

var uid = '00000000000';

module.exports = function () {
    User.findOne({uid: uid}).then((user) => {
        if(!user){
            User.create({
                uid: uid,
                userType: 'virtual',
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
        getPrimaryAccount: function(){
            return new Promise(function(resolve, reject){
                User.findOne({uid: uid})
                .then((user)=>{
                    Account.findOne({userId: user.id, accountType: AccountCode.PRIMARY}).then((account) => {
                        resolve(account);
                    }).catch((err)=>{
                        reject(err);
                    });
                }).catch((err)=>{
                    reject(err);
                });
                    
            });
        },
        getSecondaryAccount: function(){
            return new Promise(function(resolve, reject){
                User.findOne({uid: uid})
                .then((user)=>{
                    Account.findOne({userId: user.id, accountType: AccountCode.SECONDARY}).then((account) => {
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