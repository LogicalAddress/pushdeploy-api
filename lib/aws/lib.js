var _ = require('underscore');
var Request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var AwsConf = require("../../config/aws");
var AppConf = require("../../config/app");
var AWS = require('aws-sdk');
var UserAuthCredential = require('../launcher/UserAuthCredential');
var UserServer = require('../launcher/UserServers');
var generate = require('project-name-generator');
/*
*
* @Class Aws Powered by Amazon Web Services
*
**/ 

function Aws(){

}

util.inherits(Aws, EventEmitter);
/*
* Get List of Ubuntu Linux Distributions on Aws
*/
Aws.prototype.distributions = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	return new Promise(function(resolve, reject) {
		return resolve([{
			name: "Ubuntu Server 16.04 LTS (HVM),EBS General Purpose (SSD) Volume Type.",
			ImageId: "ami-0def3275",
		}]);
	});
};


/*
* Get DataCenters/Regions
*/
Aws.prototype.datacenters = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	return new Promise(function(resolve, reject) {
		resolve([
			{
				name: "us-west-2",
				description: "US West"
			},
		]);
	});
};	

/*
* Get DataCenter Info
*/
Aws.prototype.datacenter = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	return new Promise(function(resolve, reject) {
		reject("Not Implemented Yet");
	});
};	

/*
* Get List of Aws Instances
*/
Aws.prototype.instances = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	// ec2.config.update({region: payload.region || 'us-west-2'});
	return new Promise(function(resolve, reject) {
		// see for more: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#runInstances-property
		// http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html
		resolve([
			{
				name: "t2.micro",
				description: "1 CPU, 1 Gig RAM (Free tier maybe applicable)"
			},{
				name: "t2.small",
				description: "1 CPU, 2 Gig RAM"
			},{
				name: "t2.medium",
				description: "2 CPUs, 4 Gig RAM",
			},{
				name: "t2.large",
				description: "2 CPUs, 8 Gig RAM",
			},{
				name: "t2.xlarge",
				description: "4 CPUs, 16 Gig RAM",
			},{
				name: "t2.2xlarge",
				description: "8 CPUs, 32 Gig RAM",
			}
		]);
	});
};

/*
* Get Info about an Aws instance
*/
Aws.prototype.instance = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	AwsConf.ec2.region = payload.region || 'us-west-2';
	console.log("Using EC2 Credentials", AwsConf.ec2);
	var ec2 = new AWS.EC2(AwsConf.ec2);
	return new Promise(function(resolve, reject) {
		var params;
		if(payload.reservationId){
			params = {
				ReservationId: payload.reservationId,
			};
		}else{
			params = {
				InstanceIds: [payload.instanceId],
			};
		}
		ec2.describeInstances(params, function(err, diRecords) {
			// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeInstances-property
			if (err) return reject(err);
			return resolve(diRecords);
		});
	});
};


/*
* Private Method to Create a Aws EC2 Instance
*/

function _createInstance(ec2, payload, credentials, Server){
	return new Promise((resolve, reject) =>{
		console.log("using SecurityGroupIds",credentials.aws_SecurityGroupId);
		ec2.runInstances({
			MaxCount: AwsConf.ec2.MaxCount || 1,
			MinCount: AwsConf.ec2.MinCount || 1,
			ImageId: payload.ImageId,
			InstanceType: payload.InstanceType,
			KeyName: credentials.aws_KeyName,
			SecurityGroupIds: [credentials.aws_SecurityGroupId],
			BlockDeviceMappings: [
				{
					DeviceName: "/dev/sdh",
					Ebs: {
						Encrypted: false,
						DeleteOnTermination: false,
						VolumeSize: parseInt(payload.volumeSize) || 20,
						VolumeType: "gp2"
					}
				}
			]
		}, (err, response) => {
			// http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-creating-an-instance.html
			//var instanceId = response.Instances[0].InstanceId;
			if(err) { 
				process.emit('aws_instance_create_failure', Server, credentials);
				return reject(err);
			}
			return resolve(response);
		});
	});
}

/*
* Public Method to Create a Aws EC2 Instance
*/

Aws.prototype.createInstance = function(payload, mUserAuthCrendential, Server){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	AwsConf.ec2.region = payload.region || 'us-west-2';
	Server.aws_accessKeyId = payload.accessKeyId;
	Server.aws_secretAccessKey = payload.secretAccessKey;
	Server.aws_region = payload.region || 'us-west-2';
	console.log("Using EC2 Credentials", AwsConf.ec2);
	var ec2 = new AWS.EC2(AwsConf.ec2);
	// ec2.config.update({region: payload.region || 'us-west-2'});
	return new Promise(function(resolve, reject) {
		// UserAuthCredential.findByUID(payload.uid).then((mUserAuthCrendential) => {
			console.log("Checking if we have experience: ", "aws_KeyFingerprint", mUserAuthCrendential.aws_KeyFingerprint, "aws_KeyName", mUserAuthCrendential.aws_KeyName);
			if(mUserAuthCrendential.aws_KeyFingerprint && mUserAuthCrendential.aws_KeyName){
				console.log("Yes! We have experience with aws");
				_createInstance(ec2, payload, mUserAuthCrendential).then((ciResponse)=>{
					console.log("_createInstance: Response:", ciResponse);
					var bigPayload = Object.assign({ payload: payload }, { raw: ciResponse, instance: ciResponse.Instances[0]});
					Server.instanceId = ciResponse.Instances[0].InstanceId;
					Server.ipv4 = 'WAITING';
					Server.aws_account_id = ciResponse.OwnerId;
					Server.aws_reservation_id = ciResponse.ReservationId;
					Server.meta = JSON.stringify(bigPayload);
					Server.aws_KeyName = mUserAuthCrendential.aws_KeyName;
					Server.aws_KeyFingerprint = mUserAuthCrendential.aws_KeyFingerprint;
					Server.aws_KeyMaterial = mUserAuthCrendential.aws_KeyMaterial;
					Server.private_key = mUserAuthCrendential.aws_KeyMaterial;
					Server.save().then((response)=>{
						console.log("AWS Server Updated", response);
					}).catch((error)=>{
						console.log("AWS Server Update Err", error);
					});
					mUserAuthCrendential.aws_access_key = payload.accessKeyId;
					mUserAuthCrendential.aws_secret_key = payload.secretAccessKey;
					mUserAuthCrendential.save().then((response)=>{
						console.log("updated mUserAuthCrendential with aws_keys");
					}).catch((error)=>{
						console.log("updating..mUserAuthCrendential with aws_keys failed", error);	
					});
					console.log("calling resolve");
					resolve(bigPayload);
		            process.emit('aws_instance_created', bigPayload, Server);
					return;
				}).catch((error)=>{
					process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
					return reject(error);	
				});
			}else{
				console.log("Loading available VPCs");
				ec2.describeVpcs((err, dvpcsData) => {
					// http://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateVpc.html
					// http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-security-groups.html
					if(err){ 
						process.emit('aws_instance_create_failure', Server);
						return reject(err);
					}
					console.log("Available VPCs", dvpcsData);
					/*
					{ Vpcs: 
   [ { CidrBlock: '172.16.0.0/16',
       DhcpOptionsId: 'dopt-406cf324',
       State: 'available',
       VpcId: 'vpc-5e9ab038',
       InstanceTenancy: 'default',
       Ipv6CidrBlockAssociationSet: [],
       CidrBlockAssociationSet: [Object],
       IsDefault: false,
       Tags: [] },
     { CidrBlock: '172.31.0.0/16',
       DhcpOptionsId: 'dopt-406cf324',
       State: 'available',
       VpcId: 'vpc-1d677e79',
       InstanceTenancy: 'default',
       Ipv6CidrBlockAssociationSet: [],
       CidrBlockAssociationSet: [Object],
       IsDefault: true,
       Tags: [] },
     { CidrBlock: '172.16.0.0/16',
       DhcpOptionsId: 'dopt-406cf324',
       State: 'available',
       VpcId: 'vpc-d52101b3',
       InstanceTenancy: 'default',
       Ipv6CidrBlockAssociationSet: [],
       CidrBlockAssociationSet: [Object],
       IsDefault: false,
       Tags: [] } ] }
       */
    				var defaultVpcId = null;
    				for(var i = 0; i < dvpcsData.Vpcs.length; i++){
    					if(dvpcsData.Vpcs[i].IsDefault){
    						defaultVpcId = dvpcsData.Vpcs[i].VpcId;
    						break;
    					}
    				}
    				if(!defaultVpcId){
    					//create a new VPC
    					console.log("No default VPC found, attempting to create..");
    					var params = {
						  CidrBlock: "10.0.0.0/16"
						 };
						 console.log("Creating VPC...");
						 ec2.createVpc(params, function(err, data) {
						 	if(err) { 
						 		process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
						 		return reject(err);
						 	}
						 	console.log("Successful", data);
						 	console.log("creating a security group..");
						 	defaultVpcId = data.Vpc.VpcId;
							ec2.createSecurityGroup({
								Description: 'PushDeploy.io',
								GroupName: AppConf.AppName + payload.uid,
								VpcId: defaultVpcId
							}, (err, csgData) => {
								if (err){ 
									process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
									return reject(err);
								}
								console.log("successful..", csgData);
								var SecurityGroupId = csgData.GroupId;
								console.log("using security group id", SecurityGroupId);
								mUserAuthCrendential.aws_SecurityGroupId = SecurityGroupId;
								Server.aws_SecurityGroupId = SecurityGroupId;
								mUserAuthCrendential.save().then((response)=>{
									console.log("updating aws_SecurityGroupId success", response);
								}).catch((error)=>{
									console.log("updating aws_SecurityGroupId failed", error);
								});
								console.log("AuthCredentials updated");
								var paramsIngress = AwsConf.paramsIngress;
								Object.assign(paramsIngress, {GroupName: AppConf.AppName + payload.uid});
								console.log("performin...authorizeSecurityGroupIngress");
							      ec2.authorizeSecurityGroupIngress(paramsIngress, function(err, data) {
									if (err){
										process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
										return reject(err);
									}
									console.log("Ingress Successfully Set", data);
									var keyName = AppConf.AppName + payload.uid;
									console.log("proposed keyname", keyName);
									console.log("creating keypair..");
									ec2.createKeyPair({ KeyName: keyName }, (err, ckpResponse) => {
										// http://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateKeyPair.html
										if(err){ 
											process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
											return reject(err);
										}
										console.log("successful", ckpResponse);
										mUserAuthCrendential.aws_KeyName = ckpResponse.KeyName;
										mUserAuthCrendential.aws_KeyFingerprint = ckpResponse.KeyFingerprint;
										mUserAuthCrendential.aws_KeyMaterial = ckpResponse.KeyMaterial;
										Server.aws_KeyName = ckpResponse.KeyName;
										Server.aws_KeyFingerprint = ckpResponse.KeyFingerprint;
										Server.aws_KeyMaterial = ckpResponse.KeyMaterial;
										Server.private_key = ckpResponse.KeyMaterial;
										Server.save();
										console.log("Returned keyname", ckpResponse.KeyName);
										mUserAuthCrendential.save().then((response)=>{
											console.log("updating mUserAuthCrendential with aws_KeyName, aws_KeyFingerprint, aws_KeyMaterial", response);
										}).catch((error)=>{
											console.log("updating mUserAuthCrendential with aws_KeyName, aws_KeyFingerprint, aws_KeyMaterial failed", error);
										});
										console.log("update auth cred");
										console.log("calling.._createInstance");
										_createInstance(ec2, payload, mUserAuthCrendential).then((ciResponse)=>{
											console.log("_createInstance: Successful (Init):", JSON.stringify(ciResponse));
											var bigPayload = Object.assign({ 
												payload: payload }, {  raw: ciResponse, instance: ciResponse.Instances[0]});
											Server.instanceId = ciResponse.Instances[0].InstanceId;
											Server.ipv4 = 'WAITING';
											Server.aws_account_id = ciResponse.OwnerId;
											Server.aws_reservation_id = ciResponse.ReservationId;
											Server.meta = JSON.stringify(bigPayload);
											Server.save().then((response)=>{
												console.log("AWS Server Updated", response);
											}).catch((error)=>{
												console.log("AWS Server Update Err", error);
											});
											mUserAuthCrendential.aws_access_key = payload.accessKeyId;
											mUserAuthCrendential.aws_secret_key = payload.secretAccessKey;
											mUserAuthCrendential.save().then((response)=>{
												console.log("updated mUserAuthCrendential with aws_keys");
											}).catch((error)=>{
												console.log("updating..mUserAuthCrendential with aws_keys failed", error);	
											});
											console.log("calling resolve");
											resolve(bigPayload);
											process.emit('aws_instance_created', bigPayload, Server);
											return;
										}).catch((error)=>{
											process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
											return reject(error);
										});
									});
							    });
							});
						 });
    				}else{
						console.log("creating a security group..");
						ec2.createSecurityGroup({
							Description: 'PushDeploy.io',
							GroupName: AppConf.AppName + payload.uid,
							VpcId: defaultVpcId
						}, (err, csgData) => {
							if (err){ 
								process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
								return reject(err);
							}
							console.log("successful..", csgData);
							var SecurityGroupId = csgData.GroupId;
							console.log("using security group id", SecurityGroupId);
							mUserAuthCrendential.aws_SecurityGroupId = SecurityGroupId;
							Server.aws_SecurityGroupId = SecurityGroupId;
							mUserAuthCrendential.save().then((response)=>{
								console.log("updating aws_SecurityGroupId successful", response);
							}).catch((error)=>{
								console.log("updating aws_SecurityGroupId failed", error);
							});
							console.log("AuthCredentials updated");
							var paramsIngress = AwsConf.paramsIngress;
							Object.assign(paramsIngress, {GroupName: AppConf.AppName + payload.uid});
							console.log("performin...authorizeSecurityGroupIngress");
						      ec2.authorizeSecurityGroupIngress(paramsIngress, function(err, data) {
								if (err){ 
									process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
									return reject(err);
								}
								console.log("Ingress Successfully Set", data);
								var keyName = AppConf.AppName + payload.uid;
								console.log("proposed keyname", keyName);
								console.log("creating keypair..");
								ec2.createKeyPair({ KeyName: keyName }, (err, ckpResponse) => {
									// http://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateKeyPair.html
									if(err){ 
										process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
										return reject(err); 
									}
									console.log("successful", ckpResponse);
									mUserAuthCrendential.aws_KeyName = ckpResponse.KeyName;
									mUserAuthCrendential.aws_KeyFingerprint = ckpResponse.KeyFingerprint;
									mUserAuthCrendential.aws_KeyMaterial = ckpResponse.KeyMaterial;
									Server.aws_KeyName = ckpResponse.KeyName;
									Server.aws_KeyFingerprint = ckpResponse.KeyFingerprint;
									Server.aws_KeyMaterial = ckpResponse.KeyMaterial;
									Server.private_key = ckpResponse.KeyMaterial;
									Server.save();
									console.log("Returned keyname", ckpResponse.KeyName);
									mUserAuthCrendential.save().then((response)=>{
										console.log("updating mUserAuthCrendential with aws_KeyName, aws_KeyFingerprint, aws_KeyMaterial successful", response);
									}).catch((error)=>{
										console.log("updating mUserAuthCrendential with aws_KeyName, aws_KeyFingerprint, aws_KeyMaterial failed", error);
									});
									console.log("update auth cred");
									console.log("calling.._createInstance");
									_createInstance(ec2, payload, mUserAuthCrendential).then((ciResponse)=>{
										console.log("_createInstance: Successful (Init):", JSON.stringify(ciResponse));
										var bigPayload = Object.assign({ 
											payload: payload }, { raw: ciResponse, instance: ciResponse.Instances[0]});
										console.log("bigPayload done");
										Server.instanceId = ciResponse.Instances[0].InstanceId;
										console.log("instanceId done");
										Server.ipv4 = 'WAITING';
										Server.aws_account_id = ciResponse.OwnerId;
										Server.aws_reservation_id = ciResponse.ReservationId;
										console.log("aws account id done.");
										Server.meta = JSON.stringify(bigPayload);
										console.log("meta info done.");
										Server.save().then((response)=>{
											console.log("AWS Server Updated", response);
										}).catch((error)=>{
											console.log("AWS Server Update Err", error);
										});
										mUserAuthCrendential.aws_access_key = payload.accessKeyId;
										mUserAuthCrendential.aws_secret_key = payload.secretAccessKey;
										mUserAuthCrendential.save().then((response)=>{
											console.log("updated mUserAuthCrendential with aws_keys");
										}).catch((error)=>{
											console.log("updating..mUserAuthCrendential with aws_keys failed", error);	
										});
										console.log("calling resolve");
										resolve(bigPayload);
										console.log("emitting");
										process.emit('aws_instance_created', bigPayload, Server);
										return;
									}).catch((error)=>{
										process.emit('aws_instance_create_failure', Server, mUserAuthCrendential);
										return reject(error);
									});
								});
						    });
						});
    				}
							
				});
			}
		// }).catch((err)=>{
			// return reject(err);
		// });
	});
};


/*
* Boot this EC2 Instance
*/
Aws.prototype.boot = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	ec2.config.update({region: payload.region || "us-west-2"});
	return new Promise(function(resolve, reject) {
		var params = {
			InstanceIds: [payload.instanceId],
			// MaxResults: 0,
		};
		ec2.startInstances(params, function(err, siRecords) {
			// //http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-managing-instances.html
			if (err) return reject(err);
			var bigPayload = {};
			Object.assign(bigPayload, { payload: payload }, {instance: siRecords});
			process.emit('aws_instance_booted', bigPayload);
			return resolve(siRecords);
		});
	});
};

/*
* Shutdown this EC2 Instance
*/
Aws.prototype.shutdown = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	ec2.config.update({region: payload.region || "us-west-2"});
	return new Promise(function(resolve, reject) {
		var params = {
			InstanceIds: [payload.instanceId],
			// MaxResults: 0,
		};
		ec2.stopInstances(params, function(err, siRecords) {
			// //http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-managing-instances.html
			if (err) return reject(err);
			var bigPayload = {};
			Object.assign(bigPayload, { payload: payload }, {instance: siRecords});
			process.emit('aws_instance_shutdown', bigPayload);
			return resolve(siRecords);
		});
	});
};


/*
* reboot this EC2 Instance
*/
Aws.prototype.reboot = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	ec2.config.update({region: payload.region || "us-west-2"});
	return new Promise(function(resolve, reject) {
		var params = {
			InstanceIds: [payload.instanceId],
		};
		ec2.rebootInstances(params, function(err, riRecords) {
			// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#rebootInstances-property
			if (err) return reject(err);
			var bigPayload = {};
			Object.assign(bigPayload, { payload: payload }, {instance: riRecords});
			process.emit('aws_instance_rebooted', bigPayload);
			return resolve(riRecords);
		});
	});
};



/*
* Get Networking Info about this EC2 Instance
*/
Aws.prototype.networking = function(payload){
	return new Promise(function(resolve, reject) {
		this.instance(payload).then((iResponse)=>{
			return resolve(resolve);
		}).catch((error)=>{
			return reject(error);
		});
	});
};

/*
* Create DNS Entry on Route53
*/
Aws.prototype.createZone = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	return new Promise(function(resolve, reject) {
		reject("Not Implemented Yet");
	});
};


/*
* Create a Zone Record on the zone
*/
function createARecord(payload){
	return new Promise(function(resolve, reject) {
		reject("Not Implemented Yet");
	});
}


/*
* Create a Zone Record on the zone
*/

Aws.prototype.createZoneRecord = function(payload){
	var route53 = new AWS.Route53();
	var params = {
	CallerReference: payload.callerReference, /* required */
		  Name: payload.name, /* required */
		  DelegationSetId: payload.delegateSetId,
		  HostedZoneConfig: payload.hostedZoneConfig,
		  VPC: payload.vpc
		};	
	return new Promise(function(resolve, reject) {
		route53.createHostedZone(params, function(err, data) {
			  if(err) return reject(err, "Not tested yet"); // an error occurred
			  return  resolve(data);           // successful response
			});
	
	});
};

/*
* getZone
*/
Aws.prototype.getZone = function(payload){
	var route53 = new AWS.Route53();
	var params = {
		Id: payload.id
		};	
	return new Promise(function(resolve, reject) {
		route53.getHostedZone(params, function(err, data){
			if(err) return reject(err, "Not tested yet");
			return resolve(data);
		});
	});
};

module.exports = new Aws();