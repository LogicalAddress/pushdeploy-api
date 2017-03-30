var Account = require('../../lib/Account');
var Transaction = require('../../lib/Transaction');
var AppLib = require('../../lib/AppLib');

module.exports = function(){
    process.on('fundAccount', function(data){
        AppLib.generateTransactionRef().then((transactionRef) => {
            Account.findOne({accountNumber: data.toAccount}).then( (targetAccount) => {
                Transaction.create({
                    userId: targetAccount.userId,
                    accountType: targetAccount.accountType,
                    narration: data.narration || 'Deposit',
                    accountNumber: targetAccount.accountNumber,
                    transactionType: 'credit',
                    transactionRef: transactionRef,
                    amount: parseInt(data.amount),
                }).then( (response) => {
                    // Silence is golden
                });
            }).catch((err)=>{
                console.log(err);
            });
            
            Account.findOne({accountNumber: data.fromAccount}).then( (sourceAccount) => {
                Transaction.create({
                    userId: sourceAccount.userId,
                    accountType: sourceAccount.accountType,
                    narration: data.narration || 'Deposit',
                    accountNumber: sourceAccount.accountNumber,
                    transactionType: 'debit',
                    transactionRef: transactionRef,
                    amount: parseInt(data.amount),
                }).then( (response) => {
                    // Silence is golden
                });
            }).catch((err)=>{
                console.log(err);
            });
        });
    });	
};