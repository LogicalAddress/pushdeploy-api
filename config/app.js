var env = process.env.NODE_ENV || 'development';
var path = require('path');
var AppRoot = path.normalize(__dirname + '/..');

var config = {
  development: {
    AppName: 'TechPool',
    AppDomain: "csc-dretnan.c9users.io",
    AppRoot: AppRoot,
    port: 3000,
    mongoStorage: {
      url: 'mongodb://localhost:27017/techpool',
    },
    mysqlStorage: {
      url: 'mysql://root:@localhost/c9',
    },
    redis: {
      port: 6379,
      host: 'localhost'
    }
  },
  test: {
    AppName: 'TechPool',
    AppDomain: "api.cargospace.co",
    AppRoot: AppRoot,
    port: 3000,
    mongoStorage: {
      url: 'mongodb://localhost:27017/techpool',
    },
    mysqlStorage: {
      url: 'mysql://root:@localhost/c9',
    },
    redis: {
      port: 6379,
      host: 'localhost'
    }
  },
  production: {
    AppName: 'TechPool',
    AppDomain: "api.cargospace.co",
    AppRoot: AppRoot,
    port: 8080,
    mongoStorage: {
      url: process.env.MONGODB_URL,
    },
    mysqlStorage: {
      url: process.env.MYSQL_URL,
    },
    redis: {
      port: 6379,
      host: 'localhost'
    }
  }
};


module.exports = config[env];