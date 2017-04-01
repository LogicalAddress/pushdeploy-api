var Linode = require('../../lib/linode/lib');
var checkToken = require("../../validation/linode/AddToken");
var _ = require("underscore");
	/*
	* Whois Search (Using Enom)
	*/
	
	
module.exports = function (app) {
    
    app.get('/v1/linode/distributions', (req, res, next) => {
		Linode.distributions().then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/datacenters', (req, res, next) => {
		Linode.datacenters().then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/datacenters/:datacenter_id', (req, res, next) => {
		Linode.datacenter({datacenter_id: req.params.datacenter_id}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/instances', checkToken, (req, res, next) => {
		Linode.instances(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/instances/:linode_id', checkToken, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id});
		Linode.instances(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances', checkToken, (req, res, next) => {
		Linode.createInstance(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/boot', checkToken, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id});
		Linode.boot(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/shutdown', checkToken, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id});
		Linode.shutdown(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/reboot', checkToken, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id});
		Linode.reboot(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/networking', checkToken, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id});
		Linode.networking(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
};