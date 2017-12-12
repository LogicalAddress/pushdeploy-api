var env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    ec2: {
		apiVersion: '2016-11-15',
		accessKeyId: '',
		secretAccessKey: '',
		region: '',
		maxRetries: 5,
		sslEnabled: true,
	},
	paramsIngress: {
		GroupName: null,
		IpPermissions:[
		  {
		      IpProtocol: "tcp",
		      FromPort: 80,
		      ToPort: 80,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  },
		  {
		      IpProtocol: "tcp",
		      FromPort: 443,
		      ToPort: 443,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  },
		  {
		      IpProtocol: "tcp",
		      FromPort: 22,
		      ToPort: 22,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  }
		]
		}
  },
  test: {
    ec2: {
		apiVersion: '2016-11-15',
		accessKeyId: '',
		secretAccessKey: '',
		region: '',
		maxRetries: 5,
		sslEnabled: true,
	},
	paramsIngress: {
		GroupName: null,
		IpPermissions:[
		  {
		      IpProtocol: "tcp",
		      FromPort: 80,
		      ToPort: 80,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  },
		  {
		      IpProtocol: "tcp",
		      FromPort: 443,
		      ToPort: 443,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  },
		  {
		      IpProtocol: "tcp",
		      FromPort: 22,
		      ToPort: 22,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  }
		]
		}
  },
  production: {
    ec2: {
		apiVersion: '2016-11-15',
		accessKeyId: '',
		secretAccessKey: '',
		region: '',
		maxRetries: 5,
		sslEnabled: true,
	},
	paramsIngress: {
		GroupName: null,
		IpPermissions:[
		  {
		      IpProtocol: "tcp",
		      FromPort: 80,
		      ToPort: 80,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  },
		  {
		      IpProtocol: "tcp",
		      FromPort: 443,
		      ToPort: 443,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  },
		  {
		      IpProtocol: "tcp",
		      FromPort: 22,
		      ToPort: 22,
		      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
		  }
		]
		}
  }
};

module.exports = config[env];