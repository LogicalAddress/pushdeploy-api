var Linode = require('../../lib/linode/lib');
var checkToken = require("../../validation/linode/AddToken");
var _ = require("underscore");
var Auth = require("../../lib/middlewares/authenticate");
var Cred = require("../../lib/middlewares/credentials"),
UserServer = require("../../lib/launcher/UserServers"),
UserApp = require("../../lib/launcher/UserApps"),
generate = require('project-name-generator'),
notifier = require("../../lib/launcher/notifier");
	/*
	* Linode
	*/
	
var copts = {
	example_repo: "https://github.com/LogicalAddress/pushdeploy-nodejs-example.git",
	node_version: "8.9.3"
};

module.exports = function (app) {
	
	app.get('/v1/linode/types', (req, res, next) => {
		Linode.types().then((result)=>{
			res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});

    app.get('/v1/linode/images', Auth, Cred, (req, res, next) => {

		if(req.techpool.user.email === 'dretnan@logicaladdress.com'){
			Linode.images().then((result)=>{
				res.status(200).json(result);
			}).catch((error)=>{
				res.status(500).json(error);	
			});
		}else{
			return res.status(200).json({
				status: "success",
				data: {
					data: [{"id": "linode/ubuntu16.04lts", 
					"label": "Ubuntu 16.04 LTS", 
					"deprecated": false, 
					"size": 2600, 
					"created": "2016-04-22T18:11:29", 
					"description": null, 
					"created_by": "linode", 
					"type": "manual", 
					"is_public": true, 
					"vendor": "Ubuntu", 
					"expiry": null, 
					"eol": "2021-04-30T04:00:00"}]
				}
			});
		}
	});
	
	app.get('/v1/linode/datacenters', (req, res, next) => {
		Linode.datacenters().then((result)=>{
    		res.status(200).json(result);
    	}).catch((error)=>{
    		res.status(500).json(error);	
    	});
	});

	app.post('/v1/linode/instances', Auth, Cred, checkToken, async (req, res, next) => {
		_.extend(req.body, {token: req.techpool.credentials.linode_token});
		/*
		req.body
		{ template: 'nodejs',
			template_variation: 'v8.9.3',
			app_repository:
			'git@github.com:LogicalAddress/pushdeploy-nodejs-example.git',
			provider: 'linode',
			image: 'linode/ubuntu16.04lts',
			region: 'us-west',
			type: 'g6-nanode-1',
			token: '8c8c91a0c05c8f05622d56aff782e9877df31482bada656859aeb7482d4a5d49' 
		}
		   */
		   let _server, stackscript, app;
		try{
			stackscript = await Linode.createStackScript(req);
			_server = await UserServer.create({
				uid: req.techpool.user.uid,
				server_name: generate({ number: true }).dashed, // 'disgraceful-temper-7794'
				provider: 'linode',
				meta: JSON.stringify(req.body),
				private_key: req.techpool.credentials.custom_private_key,
				linode_root_password: generate().dashed + 'PDpd77;.',
				linode_stackscript_id: stackscript.data.id,
			});

			await notifier({
				uid: _server.uid || '',
				data:{
					ACTION: "CREATE_INSTANCE",
					O_REQ: req.body,
					MESSAGE: "INITIALIZING",
					DATA: _server
				}
			});

			app = await UserApp.create({
				uid: _server.uid,
				server: _server._id,
				app_name: 'default',
				app_repository: copts.example_repo,
				template: 'nodejs',
				template_variation: copts.node_version,
			});

			await notifier({
				uid: _server.uid || '',
				data:{
					ACTION: "CREATE_APP",
					O_REQ: req.body,
					MESSAGE: "INITIALIZING",
					DATA: app
				}
			});

			let linode = await Linode.createInstance(req, _server);
			console.log({linode: JSON.stringify(linode)});
			_server = await UserServer.findOne({_id: _server._id});
			_server.ipv4 = linode.data.ipv4[0];
			_server.ipv6 = linode.data.ipv6;
			_server.linode_id = linode.data.id;
			_server = await _server.save();
			res.status(200).json({body: { status: "IN_PROGRESS", data: _server }});
			setTimeout(async() => {
				await Linode.deleteStackScript(req, stackscript.data.id);
			}, 6000);
			return;
		}catch(error){
			if(stackscript && stackscript.data && stackscript.data.id){
				await Linode.deleteStackScript(req, stackscript.data.id);
			}
			if(_server && app && app._id){
				await UserApp.delete(app);
			}
			if(_server){
				await UserServer.deleteServer(_server);
			}
			console.log("CREATE SERVER LINODE ERR", error);
			return res.status(400).json({status: 'failure', message: error});
		}
		
		
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