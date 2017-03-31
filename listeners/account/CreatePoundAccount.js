var Account = require('../../lib/Account');
var AppConfig = require('../../config/app');
var AccountCode = require("../../config/AccountCode");

module.exports = function(){
    process.on('user_created', function(user){
        Account.create({
            userId: user.id,
            accountType: AccountCode.GBP,
            previousBalance: 0,
            currentBalance: user.userType == "virtual" ? AppConfig.PoolSize : 0,
        }).then(function(result){
            // Silence is golden
    	}).catch(function(err) {
    	    console.log(err);
    	    process.emit("account_creating_failed", user);
    	});
    });	
};