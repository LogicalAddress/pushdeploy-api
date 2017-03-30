module.exports = function (context, DataTypes) {
    var Transaction = context.define('transaction', {
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
        narration: { type: DataTypes.TEXT, },
        accountNumber: { type: DataTypes.STRING, },
        accountType: {type: DataTypes.STRING, }, //redundacy
        transactionType: {
            type: DataTypes.ENUM('credit', 'debit'),
        },
        transactionRef: {type: DataTypes.STRING, },
        amount: {
            type: DataTypes.BIGINT(20),
        },
    }, {
        paranoid: true, // Allow Cascade Delete
    });
    return Transaction;
};