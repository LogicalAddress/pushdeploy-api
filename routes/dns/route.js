var NameServer = require('../../lib/dns/lib.js');
var _ = require('underscore');
var checkCreateZone = require("../../validation/dns/CreateZone");
var checkImportZone = require("../../validation/dns/ImportZone");

	/*
	* NAME SERVERS with atomiadns
	*/
	
	
module.exports = function (app) {

	/*
	* All DNS Root zone (Admin)
	*/
	
	app.get('/v1/dns/zone', (req, res, next) => {
		NameServer.getAllZones().then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);
    	});
	});
	
	/*
	* Get zone info (Admin)
	*/
	
	app.get('/v1/dns/zone/:zone', (req, res, next) => {
		NameServer.getZone(req.params.zone).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);
    	});
	});
	
	/*
	* Creat a new zone (Admin)
	*/
	
	app.post('/v1/dns/zone', checkCreateZone, (req, res, next) => {
		NameServer.AddZone(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);
    	});
	});
	
	/*
	* Delete zone (Admin)
	*/
	
	app.delete('/v1/dns/zone/:zone', (req, res, next) => {
		NameServer.DeleteZone(req.params.zone).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);
    	});
	});
	
	/*
	* Export zone (Admin)
	*/
	
	app.get('/v1/dns/zone/export/:zone', (req, res, next) => {
		NameServer.GetZoneBinary(req.params.zone).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);
    	});
	});
	
	/*
	* Import zone (Admin)
	*/
	
	app.post('/v1/dns/zone/import', checkImportZone, (req, res, next) => {
		NameServer.RestoreZoneBinary(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);
    	});
	});
	
	
	/*
	* User Owned Root zone
	*/
	
	app.get('/v1/dns/user/zone', (req, res, next) => {
		res.status(200).json({});
	});
	
	/*
	* Create Zone
	*/
	
	app.post('/v1/dns/user/zone', (req, res, next) => {
		res.status(200).json({});
	});
	
	/*
	*  Update Zone
	*/
	
	app.put('/v1/dns/user/zone/:id', (req, res, next) => {
		res.status(200).json({});
	});
	
	
	/*
	* Delete Zone
	*/
	
	app.delete('/v1/dns/user/zone/:id', (req, res, next) => {
		res.status(200).json({});
	});
};