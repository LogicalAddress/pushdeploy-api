var request = require("request"),
AppConfig = require('../../config/app');

module.exports = function(response){
	//Message Broker
    console.log("Message Broker Not-Implemented", {message: response});
    return;
	var url = "https://localhost:8080/notify"
	request.post({
    	url,
    	headers: {
    		'Accept': 'application/json', 
    	},
    	json: response.data,
    },
    (error, response, body) => {
    	console.log("Webhook Response", body);
    });
};