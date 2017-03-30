module.exports = function (context, DataTypes) {
    return context.define('user', {
        id: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        uid: {
            type: DataTypes.STRING,
            unique: true  
        },
        credit_card_number: {
            type: DataTypes.STRING,
        },
        credit_card_name: {
            type: DataTypes.STRING,
        },
        credit_card_expiry_month: {
            type: DataTypes.STRING,
        },
        credit_card_expiry_year: {
            type: DataTypes.STRING,
        },
        credit_card_cvv: {
            type: DataTypes.STRING,
        },
        currency: {
            type: DataTypes.STRING,
            default: 'NGN',
        },
    }, {
        paranoid: true, // Allow Cascade Delete
    });
};