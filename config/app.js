var env = process.env.NODE_ENV || 'development';
var path = require('path');
var AppRoot = path.normalize(__dirname + '/..');

var config = {
  development: {
    AppRoot: AppRoot,
    port: 3000,
    storage: {
      url: 'mysql://root:@localhost/c9',
    },
    redis: {
      port: 6379,
      host: 'localhost'
    }
  },
  test: {
    AppRoot: AppRoot,
    port: 3000,
    storage: {
      url: 'mongodb://localhost:27017/nairabit',
    },
    redis: {
      port: 6379,
      host: 'localhost'
    }
  },
  production: {
    AppRoot: AppRoot,
    port: 8080,
    storage: {
      url: process.env.DB_CONNECTION,
    },
    redis: {
      port: 6379,
      host: 'localhost'
    }
  }
};

config[env].AppName = 'LogicalMail';
config[env].AppDomain = config[env].AppDomain || "logicalmail.ng";


module.exports = config[env];