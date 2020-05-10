var Linode = require('../../lib/linode/lib');
var checkToken = require("../../validation/linode/AddToken");
var _ = require("underscore");
var Auth = require("../../lib/middlewares/authenticate");
var Cred = require("../../lib/middlewares/credentials");
	/*
	* Whois Search (Using Enom)
	*/
	
	
module.exports = function (app) {
    
    app.get('/v1/linode/distributions', Auth, Cred, (req, res, next) => {
		Linode.distributions().then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/datacenters', Auth, Cred, (req, res, next) => {
		Linode.datacenters().then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/datacenters/:datacenter_id', Auth, Cred, (req, res, next) => {
		Linode.datacenter({datacenter_id: req.params.datacenter_id}).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/instances', Auth, Cred, (req, res, next) => {
		_.extend(req.body, {token: null});
		Linode.instances(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.get('/v1/linode/instances/:linode_id', Auth, Cred, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id});
		Linode.instances(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances', Auth, Cred, (req, res, next) => {
		_.extend(req.body, {token: null});
		Linode.createInstance(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/boot', Auth, Cred, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id, token: null});
		Linode.boot(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/shutdown', Auth, Cred, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id, token: null});
		Linode.shutdown(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/reboot', Auth, Cred, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id, token: null});
		Linode.reboot(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
	app.post('/v1/linode/instances/:linode_id/networking', Auth, Cred, (req, res, next) => {
		_.extend(req.body, {linode_id: req.params.linode_id, token: null});
		Linode.networking(req.body).then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});
	
};