if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  require('dotenv').config({path:__dirname+'/../.env'});
}

var env = process.env.NODE_ENV || 'development';
var path = require('path');
var AppRoot = path.normalize(__dirname + '/..');

var config = {
  development: {
    AppName: 'PushDeploy',
    AppDomain: process.env.API_URL,
    WebHookUrl: process.env.WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    mongoStorage: {
      url: process.env.MONGODB_URL || null,
    },
    redis: {
      port: 6379,
      host: 'localhost'
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY || null,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY || null,
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
    AppName: 'PushDeploy',
    AppDomain: process.env.API_URL || 'http://localhost',
    WebHookUrl: process.env.WEB_HOOK_URL || 'http://localhost/webhooks',
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    mongoStorage: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017/PushDeploy',
    },
    redis: {
      port: 6379,
      host: 'localhost'
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_U5qVNRp0u0u1VxqnptEbz9WK',
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_8eb0c568b925399e7192843b4c8a20bbb80a9295',
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
    AppName: 'PushDeploy',
    AppDomain: process.env.API_URL,
    WebHookUrl: process.env.WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    mongoStorage: {
      url: process.env.MONGODB_URL,
    },
    redis: {
      port: 6379,
      host: 'localhost'
    },
    ClientSetting: {
      stripeKey: 'pk_test_U5qVNRp0u0u1VxqnptEbz9WK',
      paystackKey: 'pk_test_8eb0c568b925399e7192843b4c8a20bbb80a9295',
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