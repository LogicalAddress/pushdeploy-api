if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  require('dotenv').config({path:__dirname+'/../.env'});
}

var env = process.env.NODE_ENV || 'development';
var path = require('path');
var AppRoot = path.normalize(__dirname + '/..');

var config = {
  development: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    IP: process.env.IP || '127.0.0.1',
    mongoStorage: {
      url: process.env.MONGODB_URL || "mongodb://localhost:27017/pushdeploy",
    },
    redis: {
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || 'localhost'
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_U5qVNRp0u0u1VxqnptEbz9WK',
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_8eb0c568b925399e7192843b4c8a20bbb80a9295',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
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
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT,
    IP: process.env.IP,
    mongoStorage: {
      url: process.env.MONGODB_URL,
    },
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
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
  staging: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT,
    IP: process.env.IP,
    mongoStorage: {
      url: process.env.MONGODB_URL,
    },
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
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
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT,
    IP: process.env.IP,
    mongoStorage: {
      url: process.env.MONGODB_URL,
    },
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
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