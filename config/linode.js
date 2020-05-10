var env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    END_POINT: "https://api.linode.com/v4",
    DEFAULT_SOA_VALUES: {
        "dnszone": "example.com",
        "type": "master",
        "soa_email": "admin@pushdeploy.xyz",
        "description": "Created by pushdeploy.io",
        "refresh_sec": 14400,
        "retry_sec": 3600,
        "expire_sec": 604800,
        "ttl_sec": 3600,
        "status": "active",
        "master_ips": [],
        // "axfr_ips": ["44.55.66.77"],
        "display_group": "Cargospace",
    },
    DEFAULT_A_VALUES: {
        "type": "A",
        "target": "123.456.789.101",
        "name": "example.com"
    },
  },
  test: {
    END_POINT: "https://api.linode.com/v4",
    DEFAULT_SOA_VALUES: {
        "dnszone": "example.com",
        "type": "master",
        "soa_email": "admin@pushdeploy.xyz",
        "description": "Created by pushdeploy.io",
        "refresh_sec": 14400,
        "retry_sec": 3600,
        "expire_sec": 604800,
        "ttl_sec": 3600,
        "status": "active",
        "master_ips": [],
        // "axfr_ips": ["44.55.66.77"],
        "display_group": "Cargospace",
    },
    DEFAULT_A_VALUES: {
        "type": "A",
        "target": "123.456.789.101",
        "name": "example.com"
    },
  },
  production: {
    END_POINT: process.env.LINODE_API_ENDPOINT || "https://api.linode.com/v4",
    DEFAULT_SOA_VALUES: {
        "dnszone": "example.com",
        "type": "master",
        "soa_email": "admin@pushdeploy.xyz",
        "description": "Created by pushdeploy.io",
        "refresh_sec": 14400,
        "retry_sec": 3600,
        "expire_sec": 604800,
        "ttl_sec": 3600,
        "status": "active",
        "master_ips": [],
        // "axfr_ips": ["44.55.66.77"],
        "display_group": "Cargospace",
    },
    DEFAULT_A_VALUES: {
        "type": "A",
        "target": "123.456.789.101",
        "name": "example.com"
    },
  }
};

module.exports = config[env];