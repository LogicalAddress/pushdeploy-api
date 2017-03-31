var config = require('./app');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.mysqlStorage.url);
var User = sequelize.import(config.AppRoot + "/models/mysql/User");
var Account = sequelize.import(config.AppRoot + "/models/mysql/Account");
var Transaction = sequelize.import(config.AppRoot + "/models/mysql/Transaction");

// User.sync({force: true});
// Account.sync({force: true});
// Transaction.sync({force: true});

sequelize.sync({force: true}).then(() =>{
    setTimeout(()=>{
        require("../lib/scripts/VirtualUser")();    
    }, 0);
    
});

module.exports = function() {
    
    User.hasMany(Account);
    User.hasMany(Transaction);
    Account.belongsTo(User);
    Transaction.belongsTo(User);
    
    return {
        User: User,
        Account: Account,
        Transaction: Transaction,
    };
};