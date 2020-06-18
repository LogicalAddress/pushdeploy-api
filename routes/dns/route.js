var Atomia = require('../../lib/dns/atomiadns.js');
var Route53 = require('../../lib/dns/Route53.js');
var DNS = require('../../lib/dns/index.js');
var _ = require('underscore');
var checkCreateZone = require("../../validation/dns/CreateZone");
var checkAddRecordEntry = require("../../validation/dns/AddRecordEntry");
var checkDNSPass = require("../../validation/dns/checkDNSPass");
var loadFramework = require("../../validation/dns/loadFramework");

var Auth = require("../../lib/middlewares/authenticate"),
Cred = require("../../lib/middlewares/credentials");

var NameServers = {
	Atomia,
	Route53,
};

	/*
	* NAME SERVERS
	*/
	
module.exports = function (app, io) {

	/*
	* All DNS Root zone
	*/
	
	app.get('/v1/dns/zone', Auth, Cred, (req, res, next) => {
		return DNS.findAllZone({uid: req.techpool.user.uid}).then((result)=>{
    		return res.status(200).json({body: { status: "success", data: result}});
    	}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});
	
	/*
	* Get zone info
	*/
	
	app.get('/v1/dns/zone/:id', Auth, Cred, (req, res, next) => {
		let zoneMeta;
		return DNS.findOneZone({
			uid: req.techpool.user.uid, 
			$or: [{_id: req.params.id},{app: req.params.id}]
		}).then((record)=>{
			zoneMeta = record;
			return res.status(200).json({body: { status: "success", data: zoneMeta }});
		}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});
	
	/*
	* Creat a new zone
	*/
	
	app.post('/v1/dns/zone', checkCreateZone, Auth, checkDNSPass, Cred, loadFramework, (req, res, next) => {
		let provider = req.techpool.dns.framework;
		let NameServer = NameServers[provider];
		let owner = 'pushdpeloy';
		let zoneMeta;

		NameServer.nameservers(req.body)
		.then((_nameservers)=>{
			nameservers = _nameservers;
			return DNS.createZone({
				name: req.body.name,
				uid: req.techpool.user.uid,
				app: req.body.app,
				provider: NameServers[provider].provider || 'pushdeploy.io',
				owner,
				nameservers: nameservers.join(", "),
			});
		}).then((newZone)=>{
			zoneMeta = newZone
			return NameServer.AddZone(req.body, newZone);
		}).then((zoneInfo)=>{
			console.log(`${provider}.AddZone`, {zoneInfo: zoneInfo});
			return NameServer.nameservers(req.body);
		}).then(async (nameservers)=>{
			let presults = [], promises = [];
			for(let i = 0; i < nameservers.length; i++){
				promises.push(NameServer.AddDnsRecord({
					entries: [{
						label: '@', 
						'class': 'IN', 
						ttl: 1800, 
						type: 'NS', 
						rdata: nameservers[i].trim()}]
				}, zoneMeta))
			}
			presults = await Promise.all(promises);
			promises = [];
			for(let i = 0; i < presults.length; i++){
				console.log(`${provider}.AddDnsRecord`, {result: presults[i]});
				promises.push(DNS.createDNSRecord({
					id: presults[i].id,
					name: zoneMeta.name,
					uid: req.techpool.user.uid,
					zone: zoneMeta._id,
					label: '@', 
					'class': 'IN', 
					ttl: 1800, 
					type: 'NS', 
					rdata: nameservers[i]
				}));
			}
			presults = await Promise.all(promises);
			return res.status(200).json({body: { status: "success", data: zoneMeta}});
		}).catch(async (error)=>{
			await DNS.deleteZone({_id: zoneMeta._id});
			await DNS.deleteDNSRecord({ name: zoneMeta.name });
			await NameServer.DeleteZone(zoneMeta);
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});
	
	/*
	* Delete zone
	*/
	
	app.delete('/v1/dns/zone/:id', Auth, Cred, loadFramework, (req, res, next) => {
		let provider = req.techpool.dns.framework;
		let NameServer = NameServers[provider];
		let zoneMeta, deletedZone;
		return DNS.findOneZone({
			uid: req.techpool.user.uid, 
			_id: req.params.id
		}).then((zone)=>{
			zoneMeta = zone;
			return NameServer.DeleteZone(zone);
		}).then((zone)=>{
			deletedZone = zone;
			return DNS.deleteZone({
				name: zoneMeta.name,
				uid: req.techpool.user.uid
			});
		}).then((result)=>{
			console.log('wipe all associated dns records:', "Done.")
			return DNS.deleteDNSRecord({
				zone: zoneMeta._id,
				uid: req.techpool.user.uid
			});
		}).then(()=>{
			console.log(`${provider}.DeleteZone`, {deletedZone});
			return res.status(200).json({body: { status: "success", data: zoneMeta._id }});
		}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});

	/*
	* All DNS Records for a zone
	*/
	
	app.get('/v1/dns/record/:zone_id', Auth, Cred, (req, res, next) => {
		return DNS.findAllDNSRecords({uid: req.techpool.user.uid, zone: req.params.zone_id}).then((result)=>{
			// console.log({result});
    		return res.status(200).json({body: { status: "success", data: result}});
    	}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});


	/*
	* Add a single DNS record to a zone
	*/
	
	app.post('/v1/dns/record', checkAddRecordEntry, Auth, Cred, loadFramework, (req, res, next) => {
		let provider = req.techpool.dns.framework;
		let NameServer = NameServers[provider];
		let zoneMeta;
		if(!req.body.zone){
			return res.status(400).json({status: 'failure', message: 'req.body.zone is required'});
		}
		return DNS.findOneZone({
			uid: req.techpool.user.uid, 
			_id: req.body.zone
		}).then((zone)=>{
			zoneMeta = zone;
			return NameServer.AddDnsRecord(req.body, zone)
		}).then((result)=>{
			console.log(`${provider}.AddDnsRecord`, {result});
			let payload = Object.assign({}, req.body, {id: result.id, name: zoneMeta.name, uid: req.techpool.user.uid})
			return DNS.createDNSRecord(payload);
		}).then((DNSRecord)=>{
			return res.status(200).json({body: { status: "success", data: DNSRecord}});
		}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});

	/*
	* Delete a DNS record
	*/
	
	app.delete('/v1/dns/record/:id', Auth, Cred, loadFramework, (req, res, next) => {
		let provider = req.techpool.dns.framework;
		let NameServer = NameServers[provider];
		let recordMeta;
		return DNS.findOneDNSRecord({
			uid: req.techpool.user.uid, 
			_id: req.params.id
		}).then((DNSRecord)=>{
			recordMeta = DNSRecord;
			return DNS.deleteDNSRecord({ 
				_id: req.params.id
			});
		}).then(()=>{
			return NameServer.DeleteDnsRecord(recordMeta);
		}).then((result)=>{
			console.log(`${provider}.DeleteDnsRecord`, result);
    		return res.status(200).json({body: { status: "success", data: req.params.id}});
    	}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});


	/*
	* Add Zone and A record in one single pass
	*/
	
	app.post('/v1/dns/zonerecord', checkCreateZone, checkAddRecordEntry, Auth, 
		checkDNSPass, Cred, loadFramework, (req, res, next) => {
		let provider = req.techpool.dns.framework;
		let NameServer = NameServers[provider];
		let owner = 'pushdpeloy';
		let zoneMeta, nameservers;
		return DNS.findOneZone({
			uid: req.techpool.user.uid, 
			name: req.body.name
		}).then((dns)=>{
			zoneMeta = dns;
			if(zoneMeta && zoneMeta._id){
				console.log(`DNS.findOneZone`, {dns});
				DNS.findOneDNSRecord({
					uid: req.techpool.user.uid,
					zone: zoneMeta._id,
					type: req.body.type,
					class: req.body.class,
					name: req.body.name,
					label: req.body.label,
				}).then((dnsrecord)=>{
					console.log(`DNS.findOneDNSRecord`, {dnsrecord});
					if(dnsrecord && dnsrecord._id) throw new Error('DNS Record already exists');
					return NameServer.AddDnsRecord(req.body, zoneMeta)	
				}).then((result)=>{
					console.log(`${provider}.AddDnsRecord`, {result});
					let payload = Object.assign({}, req.body, {id: result.id, zone: zoneMeta._id, uid: req.techpool.user.uid});
					return DNS.createDNSRecord(payload);
				}).then((record)=>{
					return res.status(200).json({body: { status: "success", data: {record, zone: zoneMeta}}});
				}).catch((error)=>{
					return res.status(400).json({status: 'failure', message: error.message});
				});	
			}else{

				NameServer.nameservers(req.body)
				.then((_nameservers)=>{
					nameservers = _nameservers;
					return DNS.createZone({
						name: req.body.name,
						uid: req.techpool.user.uid,
						app: req.body.app,
						provider:  NameServers[provider].provider || 'pushdeploy.io',
						owner,
						nameservers: nameservers.join(", "),
					});
				}).then((newZone)=>{
					zoneMeta = newZone
					return NameServer.AddZone(req.body, newZone); 
				}).then(async(result)=>{
					let presults = [], promises = [];
					for(let i = 0; i < nameservers.length; i++){
						promises.push(NameServer.AddDnsRecord({
							entries: [{
								label: '@', 
								'class': 'IN', 
								ttl: 1800, 
								type: 'NS', 
								rdata: nameservers[i].trim()}]
						}, zoneMeta))
					}
					presults = await Promise.all(promises);
					promises = [];
					for(let i = 0; i < presults.length; i++){
						console.log(`${provider}.AddDnsRecord`, {result: presults[i]});
						promises.push(DNS.createDNSRecord({
							id: presults[i].id,
							name: zoneMeta.name,
							uid: req.techpool.user.uid,
							zone: zoneMeta._id,
							label: '@', 
							'class': 'IN', 
							ttl: 1800, 
							type: 'NS', 
							rdata: nameservers[i]
						}));
					}
					presults = await Promise.all(promises);
					console.log(`${provider}.AddZone`, {result});
					return NameServer.AddDnsRecord(req.body, zoneMeta);
				}).then((result)=>{
					console.log(`${provider}.AddDnsRecord`, {result});
					let payload = Object.assign({}, req.body, {id: result.id, zone: zoneMeta._id, uid: req.techpool.user.uid});
					return DNS.createDNSRecord(payload);
				}).then((record)=>{
					return res.status(200).json({body: { status: "success", data: {record, zone: zoneMeta}}});
				}).catch(async (error)=>{
					await DNS.deleteZone({_id: zoneMeta._id});
					await DNS.deleteDNSRecord({ name: zoneMeta.name });
					await NameServer.DeleteZone(zoneMeta);
					return res.status(400).json({status: 'failure', message: error.message});
				});
			}
		}).catch((error)=>{
    		return res.status(400).json({status: 'failure', message: error.message});
    	});
	});
	
};