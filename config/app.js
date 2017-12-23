if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  require('dotenv').config({path:__dirname+'/../.env'});
}

var env = process.env.NODE_ENV || 'development';
var path = require('path');
var AppRoot = path.normalize(__dirname + '/..');

var config = {
  development: {
    AppName: 'TechPool',
    AppDomain: process.env.API_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    mongoStorage: {
      url: process.env.MONGODB_URL || null,
    },
    mysqlStorage: {
      url: process.env.MYSQL_URL || null,
    },
    redis: {
      port: 6379,
      host: 'localhost'
    },
    OAuth: {
      bitbucket:{
        publicKey: process.env.BITBUCKET_PUBLIC_KEY,
        secretKey: process.env.BITBUCKET_SECRET_KEY
      },
      github:{
        publicKey: process.env.GITHUB_PUBLIC_KEY,
        secretKey: process.env.GITHUB_SECRET_KEY
      }
    }
  },
  test: {
    AppName: 'TechPool',
    AppDomain: process.env.API_URL || 'http://localhost',
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    mongoStorage: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017/techpool',
    },
    mysqlStorage: {
      url: process.env.MYSQL_URL || 'mysql://dretnan:@localhost/c9',
    },
    redis: {
      port: 6379,
      host: 'localhost'
    },
    OAuth: {
      bitbucket:{
        publicKey: process.env.BITBUCKET_PUBLIC_KEY,
        secretKey: process.env.BITBUCKET_SECRET_KEY
      },
      github:{
        publicKey: process.env.GITHUB_PUBLIC_KEY,
        secretKey: process.env.GITHUB_SECRET_KEY
      }
    }
  },
  production: {
    AppName: 'TechPool',
    AppDomain: process.env.API_URL || "api.cargospace.co",
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    mongoStorage: {
      url: process.env.MONGODB_URL,
    },
    mysqlStorage: {
      url: process.env.MYSQL_URL,
    },
    redis: {
      port: 6379,
      host: 'localhost'
    },
    OAuth: {
      bitbucket:{
        publicKey: process.env.BITBUCKET_PUBLIC_KEY,
        secretKey: process.env.BITBUCKET_SECRET_KEY
      },
      github:{
        publicKey: process.env.GITHUB_PUBLIC_KEY,
        secretKey: process.env.GITHUB_SECRET_KEY
      }
    }
  }
};


module.exports = config[env];