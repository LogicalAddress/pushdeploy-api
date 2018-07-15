var request = require("request"),
AppConfig = require('../../config/app');

module.exports = function(response){
	//Webhooks or Message Broker
	var url = (response.data.O_REQ ? response.data.O_REQ.webhook || 
	    AppConfig.WebHookUrl : AppConfig.WebHookUrl);
	request.post({
    	url,
    	headers: {
    		'Accept': 'application/json', 
    	},
    	json: response.data,
    },
    (error, response, body) => {
    	console.log("Webhook Response");
    });
};