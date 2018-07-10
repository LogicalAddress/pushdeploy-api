var _ = require('underscore');
var Request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var AwsConf = require("../../config/aws");
var AppConf = require("../../config/app");
var AWS = require('aws-sdk');
var UserAuthCredential = require('../launcher/UserAuthCredential');
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
	var ec2 = new AWS.EC2(AwsConf.ec2);
	ec2.config.update({region: payload.region || "us-west-2"});
	return new Promise(function(resolve, reject) {
		var params = {
			InstanceIds: [payload.instanceId],
		};
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

function _createInstance(ec2, payload, credentials){
	return new Promise((resolve, reject) =>{
		ec2.runInstances({
			MaxCount: AwsConf.ec2.MaxCount || 1,
			MinCount: AwsConf.ec2.MinCount || 1,
			ImageId: payload.ImageId,
			InstanceType: payload.InstanceType,
			KeyName: credentials.aws_KeyName,
			SecurityGroupIds: [credentials.aws_SecurityGroupId],
			BlockDeviceMappings: [
				{
					DeviceName: "/dev/sda",
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
			if(err) return reject(err);
			return resolve(response);
		});
	});
}

/*
* Public Method to Create a Aws EC2 Instance
*/

Aws.prototype.createInstance = function(payload){
	AwsConf.ec2.accessKeyId = payload.accessKeyId;
	AwsConf.ec2.secretAccessKey = payload.secretAccessKey;
	var ec2 = new AWS.EC2(AwsConf.ec2);
	ec2.config.update({region: payload.region || 'us-west-2'});
	return new Promise(function(resolve, reject) {
		UserAuthCredential.findByUID(payload.uid).then((mUserAuthCrendential) => {
			if(mUserAuthCrendential.aws_KeyFingerprint && mUserAuthCrendential.aws_KeyName){
				_createInstance(ec2, payload, mUserAuthCrendential).then((ciResponse)=>{
					let bigPayload = {};
					Object.assign(bigPayload, { payload: payload }, {instance: ciResponse});
					process.emit('aws_instance_created', bigPayload);
					return resolve(ciResponse);
				}).catch((error)=>{
					return reject(error);	
				});
			}else{
				ec2.describeVpcs((err, dvpcsData) => {
					// http://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateVpc.html
					// http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-security-groups.html
					if(err) return reject(err);
					ec2.createSecurityGroup({
						Description: 'Node.js SDK Example',
						GroupName: 'sdk-example',
						VpcId: dvpcsData.Vpcs[0].VpcId
					}, (err, csgData) => {
						if (err) return reject(err);
						let SecurityGroupId = csgData.GroupId;
						mUserAuthCrendential.aws_SecurityGroupId = SecurityGroupId;
						mUserAuthCrendential.save();
						let paramsIngress = AwsConf.paramsIngress;
						Object.assign(paramsIngress, {GroupName: AppConf.AppName + "-" + payload.uid + "CargoSpace"});
					      ec2.authorizeSecurityGroupIngress(paramsIngress, function(err, data) {
							if (err) return reject(err);
							console.log("Ingress Successfully Set", data);
					    });
					});
					let keyName = AppConf.AppName + "-" + payload.uid;
					ec2.createKeyPair({ KeyName: keyName }, (err, ckpResponse) => {
						// http://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateKeyPair.html
						if(err) return reject(err);
						mUserAuthCrendential.aws_KeyName = ckpResponse.KeyName;
						mUserAuthCrendential.aws_KeyFingerprint = ckpResponse.KeyFingerprint;
						mUserAuthCrendential.aws_KeyMaterial = ckpResponse.KeyMaterial;
						mUserAuthCrendential.save();
						_createInstance(ec2, payload, mUserAuthCrendential).then((ciResponse)=>{
							let bigPayload = {};
							Object.assign(bigPayload, { payload: payload }, {instance: ciResponse});
							process.emit('aws_instance_created', bigPayload);
							return resolve(ciResponse);
						}).catch((error)=>{
							return reject(error);
						});
					});
				});
			}
		}).catch((err)=>{
			return reject(err);
		});
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
			let bigPayload = {};
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
			let bigPayload = {};
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
			let bigPayload = {};
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