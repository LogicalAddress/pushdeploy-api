'use strict';

const request = require('request');
const config = require("../config/app");

const emailManagement = config.emailManagement;


exports.sendEmail= (personalizations) =>
{
    let options = {
        method: 'POST',
        headers: {
       "Content-Type": "application/json"
    	},
        uri:emailManagement + '/emailManagement/send',
        body: personalizations,
        json:true
    };
    return new Promise((resolve, reject)=>{ 
        request(options, (error, response, body) => {
            return resolve(body);
        });
    });
};
