// jshint ignore: start

var Event = require("./Events");

module.exports = async function(payload){
	try{
		await Event.create({
			uid: payload.uid || '',
			message: payload.data.MESSAGE,
			action: payload.data.ACTION,
			status: payload.status || '',
			file: payload.file || '',
			error: payload.error || '',
			request: payload.data.O_REQ ? JSON.stringify(payload.data.O_REQ) : '',
			data: payload.data.DATA ? JSON.stringify(payload.data.DATA) : '',
			response: payload.data.O_RES ? JSON.stringify(payload.data.O_RES) : '',
		});
	}catch(error){
		console.log("notifier error", error.message, "Payload", payload);
	}
};