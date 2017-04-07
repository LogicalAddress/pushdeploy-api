module.exports = function (context, DataTypes) {
    return context.define('user', {
        id: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        uid: {
            type: DataTypes.STRING,
            notNull: true,
            notEmpty: true,
            unique: true   //not changeable, would be used across DBs/Servers (mongo) as this user's identifier
        },
        userType: {
            type: DataTypes.STRING,
            default: 'customer',
        },
        mobileNumber: {
            type: DataTypes.STRING,
            notNull: true,
            notEmpty: true,
            unique: true  //could change
        },
        email: {
            type: DataTypes.STRING,
            isEmail: true,
            notNull: true,
            notEmpty: true,
            unique: true  //could change
        },
        password: {
            type:DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        currency: {
            type: DataTypes.STRING,
            default: 'NGN', //see config/AccountCode.js to see what i mean.
        },
        credit_card_number: {
            type: DataTypes.STRING,
            default: '',
        },
        credit_card_name: {
            type: DataTypes.STRING,
            default: '',
        },
        credit_card_expiry_month: {
            type: DataTypes.STRING,
            default: '',
        },
        credit_card_expiry_year: {
            type: DataTypes.STRING,
            default: '',
        },
        credit_card_cvv: {
            type: DataTypes.STRING,
            default: '',
        },
    }, {
        paranoid: true, // Allow Cascade Delete
    });
};