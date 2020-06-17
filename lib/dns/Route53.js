// var _ = require('underscore');
// var Request = require('request');
// var util = require('util');
// var AppConfig = require('../../config/app');

/*
*
* @Class Route53
* https://www.ietf.org/rfc/rfc1035.txt
**/ 

function Route53(){

}

/*
* Return zone info
*/
Route53.prototype.getZone = function(zone){
	
};

/*
* Create a new zone info and clone from another zone if possible
*/
Route53.prototype.AddZone = function(zone){
	
};

/*
* Delete zone 
*/
Route53.prototype.DeleteZone = function(zone){
	
};


/*
* Delete only one DNS record from a zone (not bulk)
*/
Route53.prototype.DeleteDnsRecord = function(payload){
	
};



/*
* Add only one DNS record from a zone (not bulk)
*/
Route53.prototype.AddDnsRecord = function(payload){

};


module.exports = new Route53();