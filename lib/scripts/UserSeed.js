var User = require('../User');
var Account = require('../Account');
var AccountCode = require("../../config/AccountCode");

module.exports = function () {
    User.findOne({uid: '+2348161730129'}).then((user) => {
        if(!user){
            User.create({
                uid: '+2348161730129',
                userType: 'customer',
                mobileNumber: "+2348161730129",
                email: "dretnan@logicaladdress.com",
                password: 'yahweh',
                currency: 'USD',
                name: 'Daser Retnan'
            }).then((user)=>{
                // Silence is golden
            }).catch((err)=>{
                console.log(err);
                console.log("CreatingSeedUserFailed");
            });    
        }
    }).catch((err)=>{
        console.log(err);
    });
    
    User.findOne({mobileNumber: '+2348036504287'}).then((user) => {
        if(!user){
            User.create({
                userType: 'admin',
                mobileNumber: "+2348036504287",
                email: "d.retnan@nhubnigeria.com",
                password: 'yahweh',
                currency: 'USD',
                name: 'Daser Retnan'
            }).then((user)=>{
                // Silence is golden
            }).catch((err)=>{
                console.log(err);
                console.log("CreatingSeedUserFailed");
            });    
        }
    }).catch((err)=>{
        console.log(err);
    });
};