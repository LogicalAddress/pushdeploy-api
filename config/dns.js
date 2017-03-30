// http://ns1.cargospace.co/wsdl-atomiadns.wsdl
// http://atomia.github.io/atomiadns/apidocs.html
var env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    NameServer: {
        END_POINT: "http://ns1.cargospace.co/atomiadns.json",
        ADMIN_USER: "gorilla@cargospace.co",
        ADMIN_PASS: "faker00tX",
        DEFAULT_SOA_VALUES: [ 3600, 'ns1.cargospace.co', "hostmaster.cargospace.co", 10800, 3600, 604800, 86400 ],
        DEFAULT_NAMESERVERS: 'ns1.cargospace.co'.split(","),
        NAMESERVER_GROUP: "default",
    },
  },
  test: {
    NameServer: {
        END_POINT: "http://ns1.cargospace.co/atomiadns.json",
        ADMIN_USER: "gorilla@cargospace.co",
        ADMIN_PASS: "faker00tX",
        DEFAULT_SOA_VALUES: [ 3600, 'ns1.cargospace.co', "hostmaster.cargospace.co", 10800, 3600, 604800, 86400 ],
        DEFAULT_NAMESERVERS: 'ns1.cargospace.co'.split(","),
        NAMESERVER_GROUP: "default",
    },
  },
  production: {
    NameServer: {
        END_POINT: process.env.DNS_API || "http://ns1.cargospace.co/atomiadns.json",
        ADMIN_USER: process.env.DNS_ADMIN_USER || "gorilla@cargospace.co",
        ADMIN_PASS: process.env.DNS_ADMIN_PASS || "faker00tX",
        DEFAULT_SOA_VALUES: process.env.DNS_DEFAUL_SOA_VALUES ? process.env.DNS_DEFAUL_SOA_VALUES.split(",") : [ 3600, 'ns1.cargospace.co', "hostmaster.cargospace.co", 10800, 3600, 604800, 86400 ],
        DEFAULT_NAMESERVERS: process.env.DEFAULT_NAMESERVERS ? process.env.DEFAULT_NAMESERVERS.split(",") : [],
        NAMESERVER_GROUP: process.env.NAMESERVER_GROUP ? process.env.NAMESERVER_GROUP : "default",
    },
  }
};

if(config[env].NameServer.DEFAULT_SOA_VALUES.length != 7){
  throw new Error("DEFAULT_SOA_VALUES should be like '3600,ns.yourserver.com.,hostmaster.yourcompany.com.,10800,3600,604800,86800,86400'");
}


module.exports = config[env];