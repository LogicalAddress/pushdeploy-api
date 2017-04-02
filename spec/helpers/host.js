var config = require('../../config/app');
module.exports = function(){
	return config.AppDomain || "https://techpool-dretnan.c9users.io";
};